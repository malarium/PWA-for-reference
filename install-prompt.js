const closeConfirmation = () => {
    const cls = document.querySelector('.closeConfirmation')

    cls.innerHTML = ""
    cls.style.display = "none"
}

const remindLater = () => {
    sessionStorage.setItem("remind", true)
    closeConfirmation()
}
const dontShow = () => {
    localStorage.setItem("dontshow", true)
    closeConfirmation()
}

const promptCloseConfirmation = () => {
    const conf = document.createElement('div')

    conf.innerHTML = `
    <div class="closeConfirmation">
        <p>Czy przypomnieć Ci później o możliwości instalacji?</p>
        <div class="closeConfirmation-btns">
        <button class="remind">Przypomnij później</button>
        <button class="dontShow">Nie pokazuj więcej</button>
        </div>
    </div>
    `
    const app = document.querySelector('#app')

    const prompt = document.querySelector('.prompt')

    prompt.innerHTML = ""
    prompt.style.display = "none"

    app.appendChild(conf)

    setTimeout(() => {
        document.querySelector('.remind').addEventListener('click', remindLater)
        document.querySelector('.dontShow').addEventListener('click', dontShow)
    }, 500)
}

const showPrompt = () => {
    const prompt = document.createElement('div')

    prompt.innerHTML = `
    <div class="prompt">
        <a class="closePrompt">X</a>
        <p class="promptInfo">Zainstaluj aplikację Ryłko! kliknij <span class="share"></span> a następnie <span class="add">+</span>(Dodaj do ekranu początkowego/głównego)
        </p>
    </div>`

    const app = document.querySelector('#app')

    app.appendChild(prompt)
}

const runPWAcheck = () => {
    //Jeżeli w localStorage dontshow jest true lub w session storage remind jest true to nie pokazuj
    const hideForever = localStorage.getItem("dontshow")
    const remindLater = sessionStorage.getItem("remind")

    //Pokaż tylko jeśli w CMS zostało włączone PWA
    const checkIfPWAturnedOnInCMS = localStorage.getItem("installPWA")

    const isIos = () => {
        const userAgent = window.navigator.userAgent.toLowerCase()

        return /iphone|ipad|ipod/.test(userAgent)
    }

    const isSafari = () => {
        if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
            return true
        }
        return false
    }

    // Detects if device is in standalone mode
    const isInStandaloneMode = () => 'standalone' in window.navigator && window.navigator.standalone

    //Checks if should display install popup notification:
    if (hideForever || remindLater) {
        return
    }
    else if (isIos() && isSafari() && !isInStandaloneMode() && checkIfPWAturnedOnInCMS) {
        showPrompt()
        setTimeout(() => {
            document.querySelector('.closePrompt').addEventListener('click', promptCloseConfirmation)
        }, 500)
    }
}

window.addEventListener('load', runPWAcheck())