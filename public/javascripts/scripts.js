document.addEventListener('DOMContentLoaded', function() {
    const footer = document.querySelector('.footer');

    function adjustFooter() {
        const bodyHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;

        if (bodyHeight <= viewportHeight) {
            footer.style.position = 'absolute';
            footer.style.bottom = '0';

        } else {
            footer.style.position = 'relative';
        }

        footer.style.left = '0';
    }

    window.addEventListener('resize', adjustFooter);
    adjustFooter();


    document.getElementById('search-bar').addEventListener('input', adjustFooter);

});

document.addEventListener('DOMContentLoaded', function() {
    const cookieConsentPopup = document.getElementById('cookie-consent-popup');
    const acceptCookiesButton = document.getElementById('accept-cookies');

    if (!localStorage.getItem('cookiesAccepted')) {
        cookieConsentPopup.style.display = 'block';
    }

    acceptCookiesButton.addEventListener('click', function() {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieConsentPopup.style.display = 'none';
    });
});