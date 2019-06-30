$(".clearArticles").on("click", (event) => {
    event.preventDefault();
    $.ajax({
        method: "GET",
        url: "/api/clear"
    }).done(function () {
        location.reload();
    });
});

$(".scrapeArticles").on("click", (event) => {
    event.preventDefault();
    $.ajax({
        method: "GET",
        url: "/api/scrape"
    }).done(function () {
        location.reload();
    });
});

$('.saveArticle').on('click', (event) => {
    event.preventDefault();
    let id = event.target.attributes[1].value;
    $.ajax({
        method: "GET",
        url: "/api/articles/save/"+id
    }).done(function () {
        location.reload();
    });
});

