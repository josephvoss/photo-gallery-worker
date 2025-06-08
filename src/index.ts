import { Router } from '@tsndr/cloudflare-worker-router'

export interface Env {
    // Bindings
    PHOTO_BUCKET: R2Bucket
    ASSETS: Fetcher
    IMAGES: ImagesBinding
}

export interface MediaDefinition {
  key: string
  mimetype: string | undefined
  caption: string | undefined
}
export type ExtReq = {
    url?: string
}
const router = new Router<Env, ExtReq>()

// Serve images in index.html
// Provide endpoints to
//  * list contents of bucket
//  * fetch content of bucket
//  * How to integrate w/ cf-images? transformations?
//    * set in URL param. So we shouldn't care?
//
// Could just have list build the full html, right?
// or have this return json list of keys
router.get("/list", async ({env}) => {
  const objList: MediaDefinition[] = []
  const listOpts: R2ListOptions = {}
  while (true) {
    const objects = await env.PHOTO_BUCKET.list(listOpts);
    console.log(objects)
    for (const obj of objects.objects) {
      const mData = obj.customMetadata
      const item  = {
        key: obj.key,
        mimetype: mData?.mimeType,
        caption: mData?.description ? mData.description : mData?.createTime ? mData.createTime : obj.key.split('T')[0],
      }
      objList.push(item)
    }
    if (objects.truncated) {
      listOpts.cursor = objects.cursor
      console.log("pagingating")
    } else {
      break
    }
  }
  // Rev sort by date so newest is first. Assuming uploaded objects are in
  // correct order
  objList.sort()
  objList.reverse()
  console.log(`listed object: {objList}`)
  return new Response(JSON.stringify(objList))
})

router.get('/image/:image_id', async ({req, env}) => {
  const thumbnail: string | null = new URL(req.url)
    .searchParams.get("thumbnail")
  const object = await env.PHOTO_BUCKET.get(
    decodeURI(req.params.image_id)
  );
  if (object === null) {
    return new Response("Image Not Found", { status: 404 });
  }

  if (thumbnail) {
    console.log("Thumbnail set")
    return (await env.IMAGES.input(object.body).transform(
      {width: 150, height: 199, fit: "cover"}
    ).output({ format: "image/avif" })).response()
  } else {
    return (await env.IMAGES.input(object.body).transform(
      {fit: "cover"}
    ).output({ format: "image/avif" })).response()
  }
})

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return router.handle(request, env, ctx)
  },
} satisfies ExportedHandler<Env>;
