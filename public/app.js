function getImages() {
  fetch("/list").then( (resp) => {
    return resp.json()
  }).then( (body) => {
    console.log(body)
    const photoViewer = document.getElementById("photo-viewer")
    for (const obj of body) {
      // TODO dynamic width w/ srcset for thumbnails
      const newImg = document.createElement("img")
      newImg.alt = obj.caption
      newImg.src = `/image/${obj.key}?thumbnail=true`

      const newHref = document.createElement("href")
      newHref.setAttribute("href", `/image/${obj.key}`)

      newHref.dataset.fancybox = "gallery"
      newHref.dataset.caption = obj.caption
      newHref.appendChild(newImg)

      photoViewer.appendChild(newHref)
    }
  })
}

getImages()
