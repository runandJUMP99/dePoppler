// MODALS


$(".item-img-container").on("click", function() {
    $(".backdrop").addClass("open");
    $(".backdrop").addClass("modal__backdrop");
    $(".modal__upload-img").addClass("open");
});

$(".add-item-button").on("click", function() {
    $(".backdrop").addClass("open");
    $(".backdrop").addClass("modal__backdrop");
    $(".modal__new-item").addClass("modal__open");
});

$(".backdrop").on("click", function() {
    $(".backdrop").removeClass("open");
    $(".backdrop").removeClass("modal__backdrop");
    $(".modal__new-item").removeClass("modal__open");
    $(".modal__upload-img").removeClass("open");
    $(".sidebar").removeClass("sidebar__expand");
    $(".expand").html("<i class='fas fa-angle-right'></i>");
    $(".sidebar-text").removeClass("open");
    $(".sidebar__link").removeClass("text-align-left");
    $(".add-item-button").removeClass("text-align-left");
});


//SIDEBAR


$(".expand").on("click", function() {
    if ($(".sidebar").hasClass("sidebar__expand")) {
        $(".backdrop").removeClass("open");
        $(".sidebar").removeClass("sidebar__expand");
        $(".expand").html("<i class='fas fa-angle-right'></i>");
        $(".sidebar-text").removeClass("open");
        $(".sidebar__link").removeClass("text-align-left");
        $(".add-item-button").removeClass("text-align-left");
    } else {
        $(".backdrop").addClass("open");
        $(".sidebar").addClass("sidebar__expand");
        $(".expand").html("<i class='fas fa-angle-left'></i>");
        $(".sidebar-text").addClass("open");
        $(".sidebar__link").addClass("text-align-left");
        $(".add-item-button").addClass("text-align-left");
    }
});