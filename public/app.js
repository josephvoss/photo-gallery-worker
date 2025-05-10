// TODO dynamic width w/ srcset for thumbnails
function buildImageHTML(imagePath, gallery, alttext) {
  return `<a href="/cdn-cgi/image/fit=cover/${imagePath}" data-fancybox="${gallery}">
  <img alt="${alttext}" src="/cdn-cgi/image/fit=cover,width=150/${imagePath}"></a>`
}
function getImages() {
  fetch("/list").then( (resp) => {
    return resp.json()
  }).then( (body) => {
    console.log(body)
    var outHTML = ""
    for (const obj of body) {
      const imageHTML = buildImageHTML(`/image/${obj}`, "gallery", obj)
      outHTML += imageHTML
      console.log(imageHTML)
    }
    document.getElementById("photo-viewer").innerHTML = outHTML
  })
}

getImages()
