function injectApiObservers() {
    const s = document.createElement('script');
    s.src = chrome.runtime.getURL("api_observers/xhr_observer.js");
    s.onload = () => s.remove();
    document.documentElement.append(s);

    const s2 = document.createElement('script');
    s2.src = chrome.runtime.getURL("api_observers/fetch_observer.js");
    s2.onload = () => s2.remove();
    document.documentElement.append(s2);

}

injectApiObservers();
