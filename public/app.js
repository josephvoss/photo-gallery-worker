function getImages() {
  fetch("/list").then( (resp) => {
    return resp.json()
  }).then( (body) => {
    console.log(body)
    var outHTML = ""
    const photoViewer = document.getElementById("photo-viewer")
    for (const obj of body) {
      // TODO dynamic width w/ srcset for thumbnails
      const newImg = document.createElement("img")
      newImg.alt = obj
      newImg.src = `/cdn-cgi/image/fit=cover,width=150/image/${obj}`

      const newHref = document.createElement("href")
      newHref.setAttribute("href", `/cdn-cgi/image/fit=cover/image/${obj}`)
      newHref.dataset.fancybox = "gallery"
      newHref.appendChild(newImg)

      photoViewer.appendChild(newHref)
    }
  })
}

getImages()
