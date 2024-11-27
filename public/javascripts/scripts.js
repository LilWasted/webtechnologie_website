document.addEventListener('DOMContentLoaded', function() {
    const footer = document.querySelector('.footer');
    const bodyHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;

    if (bodyHeight <= viewportHeight) {
        footer.style.position = 'absolute';
    } else {
        footer.style.position = 'relative';

    }

    footer.style.left = '0';
    footer.style.bottom = '0';
});