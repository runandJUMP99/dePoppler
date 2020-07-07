// MODALS


$(".item-img-container").on("click", function() {
    $(".backdrop").addClass("open");
    $(".modal__upload-img").addClass("open");
});

$(".add-item-button").on("click", function() {
    $(".backdrop").addClass("open");
    $(".modal__new-item").addClass("modal__open");
});

$(".backdrop").on("click", function() {
    $(".backdrop").removeClass("open");
    $(".modal__new-item").removeClass("modal__open");
    $(".modal__upload-img").removeClass("open");
});


//SIDEBAR


$(".expand").on("click", function() {
    if ($(".sidebar").hasClass("sidebar__expand")) {
        $(".sidebar").removeClass("sidebar__expand");
        $(".expand").html("<i class='fas fa-angle-right'></i>");
        $(".sidebar-text").removeClass("open");
    } else {
        $(".sidebar").addClass("sidebar__expand");
        $(".expand").html("<i class='fas fa-angle-left'></i>");
        $(".sidebar-text").addClass("open");
    }
});




// const mainNavFixed = document.querySelector(".main-nav__fixed")
// let visible = false

// window.addEventListener("scroll", function() {
//     const currentScrollPos = window.pageYOffset;
//     let visible = currentScrollPos > 475;
//     if (visible) {
//         mainNavFixed.classList.add("main-nav__fixed__show")
//     } else {
//         mainNavFixed.classList.remove("main-nav__fixed__show")
//     }
// });