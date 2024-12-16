$(document).ready(function () {
    // Dữ liệu giả lập bao gồm trường hình ảnh và mở rộng thông tin
    const data = [
        {"id":"01","name":"Đỗ Trần Tuấn Anh","mssv":"48.01.104.010","image":"../static/images/userImage/1.jpg"},
        {"id":"01","name":"Trần Quốc Ấn","mssv":"48.01.104.002","image":"../static/images/userImage/4.jpg"},
        {"id":"01","name":"Phạm Trọng Đức","mssv":"48.01.104.031","image":"../static/images/userImage/3.jpg"},
        {"id":"01","name":"Nguyễn Thiên Khiêm ","mssv":"48.01.104.070","image":"../static/images/userImage/2.jpg"},
        {"id":"01","name":"Võ Văn Thịnh","mssv":"48.01.104.129","image":"../static/images/userImage/5.jpg"}



    ];

    const itemsPerPage = 3; // Số item mỗi trang
    let currentPage = 1;

    // Render dữ liệu item
    function renderItems() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const currentItems = data.slice(start, end);

        $("#item-list").empty(); // Xóa danh sách cũ
        currentItems.forEach(item => {
            $("#item-list").append(`
                <div class="card center">
                    <img src="${item.image}" alt="${item.name}" class="peopleImage" />
                    <h3 style="margin-top:20px;">${item.name}</h3>
                    <p class="center" style="height:25px;">Mã số sinh viên:</br> ${item.mssv}</p>
                </div>
            `);
        });
                // Pagination Info
                $("#page-info").text(`Page ${currentPage} of ${Math.ceil(data.length / itemsPerPage)}`);
                updateButtons();
    }
// Xử lý nút next và previous

function updateButtons() {
    $("#prev").prop("disabled", currentPage === 1);
    $("#next").prop("disabled", currentPage * itemsPerPage >= data.length);
}

$("#prev").click(function () {
    if (currentPage > 1) {
        currentPage--;
        renderItems();
    }
});

$("#next").click(function () {
    if (currentPage * itemsPerPage < data.length) {
        currentPage++;
        renderItems();
    }
});
    // Gọi hàm renderItems khi trang đã tải xong
    renderItems();
});

