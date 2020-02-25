let i = 0;

$(".carousel-control-next").on("click", function() {
    i++;

    if (i === 4) {
        $(".intro-modal").removeClass("open");
        $(".intro-backdrop").removeClass("open");
    }
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