export default function() {
    let urlServiceReg = `${process.env.PUBLIC_URL}/sw.js`
    navigator.serviceWorker.register(urlServiceReg).then(resp => {
        console.warn("Response", urlServiceReg, process.env, resp)
    })
}