$(".clearArticles").on("click", (event) => {
    event.preventDefault();
    $.ajax({
        method: "GET",
        url: "/api/clear"
    }).done(function () {
        location.reload();
    });
});

$('.deleteArticle').on('click', (event) => {
    event.preventDefault();
    let id = event.target.attributes[1].value;
    $.ajax({
        method: "GET",
        url: '/api/articles/delete/' + id
    }).done(function () {
        location.reload();
    });
});

$('.getNotes').on('click', (event) => {
    event.preventDefault();
    let id = event.target.attributes[1].value;
    $.ajax({
        method: "GET",
        url: '/api/articles/' + id
    }).done(function (data) {
        console.log(data);
        $('#articleId').text(data._id);
        if ((data.note === undefined) || (data.note.length === 0)) {
            let li = $('<li>').text('No notes for this article yet.').attr('class', 'list-group-item mb-1');
            $('#noteList').empty();
            $('#noteList').append(li);
        }
        else {
            $('#noteList').empty();
            data.note.forEach(note => {
                let li = $('<li>').text(note.body).attr('class', 'list-group-item').attr('data-id', note._id);
                let deleteBtn = $("<button>").text("Remove Note").attr('class', 'btn btn-small btn-danger removeNote float-right');
                li.append(deleteBtn);
                $('#noteList').append(li);
            });
        }

        $('#myModal').modal('show');
    });
});

$('#noteSubmit').on('click', (event) => {
    event.preventDefault();
    let id = $('#articleId').text();
    console.log(id);
    if ($('#noteInput').val().trim() != 0) {
        $.ajax({
            method: "POST",
            url: '/api/articles/' + id,
            data: {
                body: $('#noteInput').val().trim()
            }
        }).done(function () {
            $('#noteInput').val("");
            $('#myModal').modal('toggle');
        });
    }
});

$('body').on('click', '.removeNote', (event) =>{
    event.preventDefault();
    let id = event.target.parentElement.attributes[1].value;
    $.ajax({
        method: "GET",
        url: '/api/notes/delete/' + id
    }).done(function () {
        $('#myModal').modal('hide');
    });
});

