const slides = document.querySelector('.slides');
const images = document.querySelectorAll('.slides img');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
let index = 0;
const totalImages = images.length;

function showSlide() {
    slides.style.transform = `translateX(${-index * 100}%)`;
}

nextButton.addEventListener('click', () => {
    index = (index + 1) % totalImages;
    showSlide();
});

prevButton.addEventListener('click', () => {
    index = (index - 1 + totalImages) % totalImages;
    showSlide();
});

showSlide();