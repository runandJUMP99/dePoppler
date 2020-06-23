const mainNavFixed = document.querySelector(".main-nav__fixed")
let visible = false

window.addEventListener("scroll", function() {
    const currentScrollPos = window.pageYOffset;
    let visible = currentScrollPos > 475;
    console.log(currentScrollPos);
    if (visible) {
        mainNavFixed.classList.add("main-nav__fixed__show")
    } else {
        mainNavFixed.classList.remove("main-nav__fixed__show")
    }
});


let i = 0;

$(".intro-modal-next").on("click", function() {
    i++;

    console.log(i);

    if (i === 4) {
        $(".intro-modal").removeClass("open");
        $(".intro-backdrop").removeClass("open");
    }
});

$(".intro-modal-prev").on("click", function() {
    i--;

    if (i < 0) {
        i = 0;
    }
});

$(".carousel").carousel({
    interval: false
});

$(".item-img-container").on("click", function() {
    $(".backdrop").addClass("open");
    $(".modal__upload-img").addClass("open");
});

$(".upload-button").on("click", function() {
    $(".backdrop").addClass("open");
    $(".modal__new-item").addClass("open");
});

$(".backdrop").on("click", function() {
    $(".backdrop").removeClass("open");
    $(".modal__new-item").removeClass("open");
    $(".modal__upload-img").removeClass("open");
});