const cacheName = "app_v1"
this.addEventListener("install", event => {
    event.waitUntil(
        caches.open(cacheName).then((cache)=> {
            cache.addAll([
                '/static/js/bundle.js',
                '/manifest.json',
                '/index.html',
                '/',
                '/favicon.ico',
                '/logo192.png',
                'https://cdn.jsdelivr.net/npm/react-bootstrap@next/dist/react-bootstrap.min.js'
            ])
        })
    )
})

this.addEventListener("fetch", event => {
    if(!navigator.onLine) {
        event.respondWith(
            caches.match(event.request).then(resp => {
                if(resp) {
                    return resp
                }
            })
        )
    }
})