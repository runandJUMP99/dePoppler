const mainNavFixed = document.querySelector(".main-nav__fixed")
let visible = false

// window.addEventListener("scroll", function() {
//     const currentScrollPos = window.pageYOffset;
//     let visible = currentScrollPos > 475;
//     if (visible) {
//         mainNavFixed.classList.add("main-nav__fixed__show")
//     } else {
//         mainNavFixed.classList.remove("main-nav__fixed__show")
//     }
// });

$(".item-img-container").on("click", function() {
    $(".backdrop").addClass("open");
    $(".modal__upload-img").addClass("open");
});

$(".upload-button").on("click", function() {
    $(".backdrop").addClass("open");
    $(".modal__new-item").addClass("modal__open");
});

$(".backdrop").on("click", function() {
    $(".backdrop").removeClass("open");
    $(".modal__new-item").removeClass("modal__open");
    $(".modal__upload-img").removeClass("open");
});