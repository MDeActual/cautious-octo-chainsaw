const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { createApp } = require('../dist/app.js');
const { FileEvidenceStore, DelegatedGraphCollector } = require('../dist/evidence.js');
const A = '11111111-1111-4111-8111-111111111111', B = '22222222-2222-4222-8222-222222222222';
const O = '33333333-3333-4333-8333-333333333333', X = '44444444-4444-4444-8444-444444444444';
const evidence = (tid=A) => ({ id:'fixture', tenant_id:tid, collected_at:new Date().toISOString(), source:'microsoft_graph', secure_score:{ current:20,max:100,percentage:20,reported_at:'2026-01-01T00:00:00Z' }, controls:[], limitations:['Fixture'] });
async function fixture(run, collector) {
 const dir=mkdtempSync(join(tmpdir(),'securepulse-evidence-')); const store=new FileEvidenceStore(dir); let calls=0;
 const app=createApp(async token => ({tid:token==='tenant-b.fixture.signature'?B:A,oid:token==='outsider.fixture.signature'?X:O}), { members:new Set([`${A}:${O}`,`${B}:${O}`]), store, collector:collector??{configured:true,collect:async tid=>{calls++;return evidence(tid)}} });
 const server=app.listen(0,'127.0.0.1'); await new Promise(r=>server.once('listening',r));
 const request=async(action,method='GET',token='member',tid=A)=>{const response=await fetch(`http://127.0.0.1:${server.address().port}/assessment-evidence/${tid}/${action}`,{method,headers:{Authorization:`Bearer ${token}.fixture.signature`}});return {status:response.status,body:await response.json()}};
 try {await run({request,store,dir,calls:()=>calls});} finally {await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
}
test('explicit member permission denies same-tenant outsiders before collection or stored reads', async()=>fixture(async({request,calls})=>{
 for(const action of ['current','history','connection']) assert.equal((await request(action,'GET','outsider')).status,403);
 for(const action of ['connect','refresh','disconnect']) assert.equal((await request(action,'POST','outsider')).status,403);
 assert.equal(calls(),0);
}));
test('cross-tenant selectors are rejected before collection',async()=>fixture(async({request,calls})=>{
 assert.equal((await request('connect','POST','member',B)).status,403);assert.equal(calls(),0);
}));
test('collection persists across store reopens; tenant histories isolate; disconnect blocks access and refresh',async()=>fixture(async({request,store,dir,calls})=>{
 assert.equal((await request('current')).status,409);
 assert.equal((await request('connect','POST')).status,201);
 assert.equal(new FileEvidenceStore(dir).history(A).length,1);assert.equal(store.history(B).length,0);
 assert.equal((await request('history')).body.data[0].tenant_id,A);
 assert.equal((await request('disconnect','POST')).body.data.microsoft_consent_revoked,false);
 assert.equal((await request('current')).status,409);assert.equal((await request('refresh','POST')).status,409);assert.equal(calls(),1);
 assert.equal(store.history(A).length,1,'disconnect is not deletion');
}));
test('mismatched collector data is never persisted',async()=>fixture(async({request,store})=>{
 assert.equal((await request('connect','POST')).status,502);assert.deepEqual(store.history(A),[]);
},{configured:true,collect:async()=>evidence(B)}));
test('disconnect during in-flight refresh discards result',async()=>{
 let finish;let count=0;const collector={configured:true,collect:async()=>{count++;if(count===1)return evidence();return new Promise(r=>finish=r)}};
 await fixture(async({request,store})=>{await request('connect','POST');const running=request('refresh','POST');while(!finish)await new Promise(r=>setTimeout(r,5));await request('disconnect','POST');finish(evidence());assert.equal((await running).status,409);assert.equal(store.history(A).length,1)},collector);
});
test('unconfigured collector never calls network',async()=>{
 let calls=0;const collector=new DelegatedGraphCollector(A,'',async()=>{calls++});await assert.rejects(collector.collect(A,'token'),e=>e.status===503);assert.equal(calls,0);
});
test('OBO uses verified tenant and exact read-only scope; tokens are not persisted in evidence',async()=>{
 const urls=[];const collector=new DelegatedGraphCollector(A,'fixture-secret',async(url,init)=>{
  urls.push(url);assert.equal(init.redirect,'error');
  if(url.includes('/token')){assert.equal(init.body.get('assertion'),'api-token');assert.equal(init.body.get('scope'),'https://graph.microsoft.com/SecurityEvents.Read.All');return {ok:true,json:async()=>({access_token:'graph-token'})}}
  assert.equal(init.headers.Authorization,'Bearer graph-token');
  return {ok:true,json:async()=>({value:url.includes('secureScores?')?[{azureTenantId:A,currentScore:20,maxScore:100,createdDateTime:'2026-01-01T00:00:00Z'}]:[{id:'mfa',title:'Protect accounts',actionUrl:'javascript:alert(1)'}]})};
 });
 const data=await collector.collect(A,'api-token');assert.equal(data.secure_score.percentage,20);assert.equal(data.controls[0].action_url,null);
 assert.ok(!JSON.stringify(data).includes('token'));assert.equal(urls.length,3);assert.ok(urls[0].includes(`/${A}/oauth2/`));
});
test('missing or invalid score never becomes zero; role denial is explicit',async()=>{
 for(const score of [undefined,{azureTenantId:A,currentScore:0,maxScore:0,createdDateTime:'2026-01-01T00:00:00Z'},{azureTenantId:B,currentScore:1,maxScore:10,createdDateTime:'2026-01-01T00:00:00Z'}]){
  const collector=new DelegatedGraphCollector(A,'fixture',async(url)=>({ok:true,json:async()=>url.includes('/token')?{access_token:'t'}:{value:score?[score]:[]}}));
  await assert.rejects(collector.collect(A,'a'),e=>[404,502].includes(e.status));
 }
 const denied=new DelegatedGraphCollector(A,'fixture',async()=>({ok:false,status:403}));await assert.rejects(denied.collect(A,'a'),e=>e.status===403);
});
test('absent storage fails closed and file path selectors cannot escape tenant boundary',()=>{
 const store=new FileEvidenceStore('');assert.equal(store.ready,false);assert.throws(()=>store.history(A),e=>e.status===503);
 const dir=mkdtempSync(join(tmpdir(),'securepulse-evidence-'));try{assert.throws(()=>new FileEvidenceStore(dir).history('../escape'));}finally{rmSync(dir,{recursive:true,force:true})}
});
test('newest returned score is selected, irrespective of upstream ordering',async()=>{
 const collector=new DelegatedGraphCollector(A,'fixture',async(url)=>({ok:true,json:async()=>url.includes('/token')?{access_token:'t'}:{value:url.includes('secureScores?')?[
 {azureTenantId:A,currentScore:10,maxScore:100,createdDateTime:'2026-01-01T00:00:00Z'},
 {azureTenantId:A,currentScore:30,maxScore:100,createdDateTime:'2026-02-01T00:00:00Z'}]:[]}}));
 assert.equal((await collector.collect(A,'a')).secure_score.current,30);
});
test('membership configuration is explicit and validates immutable identifiers',()=>{
 const {loadMembers}=require('../dist/auth.js');assert.equal(loadMembers('').size,0);
 assert.equal(loadMembers(JSON.stringify([`${A}:${O}`])).has(`${A}:${O}`),true);
 for(const v of ['{}','["user@example.test"]','["../escape"]']) assert.throws(()=>loadMembers(v));
});
test('control guidance prioritizes observed point gaps and preserves unknown values as null',async()=>{
 const collector=new DelegatedGraphCollector(A,'fixture',async(url)=>({ok:true,json:async()=>url.includes('/token')?{access_token:'t'}:{value:url.includes('secureScores?')?[{azureTenantId:A,currentScore:10,maxScore:100,createdDateTime:'2026-01-01T00:00:00Z',controlScores:[{controlName:'low',score:4},{controlName:'high',score:1},{controlName:'invalid',score:99}]}]:[{id:'unknown',title:'Unknown',maxScore:10},{id:'low',title:'Low',maxScore:5},{id:'high',title:'High',maxScore:10},{id:'invalid',title:'Invalid',maxScore:10}]}}));
 const data=await collector.collect(A,'a');assert.deepEqual(data.controls.map(c=>c.score_gap),[9,1,null,null]);assert.equal(data.controls[0].id,'high');
});
