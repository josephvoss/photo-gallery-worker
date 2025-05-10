import { Router } from '@tsndr/cloudflare-worker-router'

export interface Env {
    // Bindings
    PHOTO_BUCKET: R2Bucket;
    ASSETS: Fetcher;
}
export type ExtReq = {
    url?: string
}
export type ExtCtx = {
}
const router = new Router<Env, ExtCtx, ExtReq>()

// Serve images in index.html
// Provide endpoints to
//  * list contents of bucket
//  * fetch content of bucket
//  * How to integrate w/ cf-images? transformations?
//    * set in URL param. So we shouldn't care?
//
// Could just have list build the full html, right?
// or have this return json list of keys
router.get("/list", async ({env, req, ctx}) => {
  var objList: string[] = []
  var listOpts: R2ListOptions = {}
  while (true) {
    const objects = await env.PHOTO_BUCKET.list(listOpts);
    console.log(objects)
    for (const obj of objects.objects) {
      // TODO this should be obj.key, but type err?
      objList.push(obj.key)
    }
    if (objects.truncated) {
      listOpts.cursor = objects.cursor
      console.log("pagingating")
    } else {
      break
    }
  }
  console.log(`listed object: {objList}`)
  return new Response(JSON.stringify(objList))
})

// TODO may need to not have router
router.get('/image/:image_id', async ({req, env}) => {
  const object = await env.PHOTO_BUCKET.get(req.params.image_id);

  if (object === null) {
    return new Response("ImageNot Found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  // why?
  headers.set("etag", object.httpEtag);

  return new Response(object.body, {
    headers,
  });
})

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return router.handle(request, env, ctx)
  },
} satisfies ExportedHandler<Env>;
