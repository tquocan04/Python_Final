const apiUrl = "https://110d-2405-4802-801c-5430-fa-bbd0-781f-1ba3.ngrok-free.app"; // Địa chỉ API Flask
$(document).ready(async function () {
    
    const response = await fetch(`${apiUrl}/all-animals`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            // 'Content-Type': 'application/json',
        }
    });
        
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

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
                <div class="card">
                        <div class="image_panel">  
                            <div class="circle"></div>    
                            <img src="${item.img}" alt="${item.Name_Eng}" class="animal-image" />
                        </div>
                        <h3> ${item.Name_Vie}</br> (${item.Name_Eng}) </h3>
                    <p>${truncateText(item.mo_ta, 50)}</p>
                    ${item.sound_url ? `
                        <div class="audio-container">
                            <img src="../static/images/Speaker.png" alt="Speaker" class="audio-icon" data-sound="${item.sound_url}" />
                            <audio class="audio-player">
                                <source src="${item.sound_url}" type="audio/mpeg">
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    ` : ""}                    
                </div>
            `);
        });

        // Pagination Info
        $("#page-info").text(`Page ${currentPage} of ${Math.ceil(data.length / itemsPerPage)}`);
        updateButtons();
    }
    renderItems();
    // Cập nhật trạng thái nút Prev/Next
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

});


function truncateText(text, maxWords) {
    const words = text.split(" ");
    if (words.length > maxWords) {
        return words.slice(0, maxWords).join(" ") + " ...";
    }
    return text;
}

$(document).on("click", ".audio-icon", function () {
    const audioElement = $(this).siblings(".audio-player")[0];
    const isPlaying = !audioElement.paused;

    if (isPlaying) {
        audioElement.pause();
        audioElement.currentTime = 0; // Reset lại thời gian phát
        $(this).attr("src", "../static/images/speaker.png"); // Quay về hình loa
    } else {
        $(".audio-player").each(function () {
            this.pause(); // Dừng tất cả audio khác
            this.currentTime = 0;
            $(this).siblings(".audio-icon").attr("src", "../static/images/speaker.png"); // Quay về hình loa
        });

        audioElement.play();
        $(this).attr("src", "../static/images/mute.png"); // Chuyển sang hình mute

        // Quay về loa sau khi phát xong
        audioElement.onended = () => {
            $(this).attr("src", "../static/images/speaker.png");
        };
    }
});


const uploadContainer = document.getElementById("upload-container");
const fileInput = document.getElementById("file-input");
const previewImage = document.getElementById("preview");

// Sự kiện click vào khu vực upload
uploadContainer.addEventListener("click", () => {
    fileInput.click();
});

// Xử lý file được chọn
fileInput.addEventListener("change", (event) => {
    handleFileUpload(event.target.files[0]);
});

// Xử lý kéo thả file
uploadContainer.addEventListener("dragover", (event) => {
    event.preventDefault();
    uploadContainer.style.borderColor = "#aaa";
});

uploadContainer.addEventListener("dragleave", () => {
    uploadContainer.style.borderColor = "#ccc";
});

uploadContainer.addEventListener("drop", (event) => {
    event.preventDefault();
    uploadContainer.style.borderColor = "#ccc";
    const file = event.dataTransfer.files[0];
    handleFileUpload(file);
});

// Hàm xử lý và hiển thị ảnh preview
function handleFileUpload(file) {
    if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.style.display = "block";
        };
        reader.readAsDataURL(file);
    }
}
$(document).ready(function () {
    let uploadedFile = null; // Biến lưu trữ hình ảnh đã tải lên

    // Xử lý file được chọn
    const fileInput = document.getElementById("file-input");
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        handleFileUpload(file);
    });

    function handleFileUpload(file) {
        if (file && file.type.startsWith("image/")) {
            uploadedFile = file; // Gán hình ảnh vào biến
            const reader = new FileReader();
            reader.onload = (e) => {
                $("#preview").attr("src", e.target.result).show();
            };
            reader.readAsDataURL(file);
        }
    }

    // Sự kiện click nút "Run"
    $("#runCode").click(async function () {
        if (!uploadedFile) {
            alert("Vui lòng tải lên một hình ảnh trước khi chạy!");
            return;
        }

        const formData = new FormData();
        formData.append("file", uploadedFile);

        try {
            const response = await fetch(`${apiUrl}/predict`, {
                method: "POST",
                body: formData,
                headers: {
                    "Accept": "application/json"
                }
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error response:", errorData);
                throw new Error(`Không thể nhận kết quả từ API! Mã lỗi: ${response.status}`);
            }
    
            const data = await response.json();
            
            renderAnimalInfo(data);
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu:', error.message);
            alert(`Đã có lỗi xảy ra: ${error.message}`);
        }
        
    });

    // Hàm hiển thị kết quả lên giao diện
    function renderAnimalInfo(data) {
        if (!data.animal_info || !data.animal_info?.Name_Eng) {
            alert("Không có dữ liệu kết quả.");
            return;
        }

        // Hiển thị các thông tin nhận diện
        $("#noti").hide();
        $("#animalInfo").show();
        $("#animalNameVie").text(data.animal_info?.Name_Vie || "N/A");
        $("#animalNameEng").text(data.animal_info?.Name_Eng || "N/A");
        $("#animalDescription").text(data.animal_info?.mo_ta || "Không có mô tả");
        $("#animalConfidence").text(data.confidence || "0");

        // Xử lý progress bar cho độ tin cậy
        $(".w3-white").css("width", `${data.confidence || 0}%`);

        // Xử lý âm thanh
        if (data.animal_info?.sound_url) {
            $("#animalSoundSource").attr("src", data.animal_info?.sound_url);
            $("#animalSound")[0].load(); // Load lại audio mới
            $("#animalSound").show();
            $("#animalSoundIcon").show();
            $("#animalSoundPlaceholder").hide();
    
            // Xử lý sự kiện click (xóa sự kiện cũ trước khi thêm mới)
            $("#animalSoundIcon").off("click").on("click", function () {
                const audioElement = $("#animalSound")[0];
                const soundIconImage = $("#soundIconImage");
    
                if (audioElement.paused) {
                    audioElement.play();
                    soundIconImage.attr("src", "../static/images/mute.png"); // Biểu tượng mute
                } else {
                    audioElement.pause();
                    audioElement.currentTime = 0;
                    soundIconImage.attr("src", "../static/images/speaker.png"); // Biểu tượng loa
                }
    
                // Khi kết thúc phát, chuyển về biểu tượng loa
                audioElement.onended = () => {
                    soundIconImage.attr("src", "../static/images/speaker.png");
                };
            });
        } else {
            $("#animalSound").hide();
            $("#animalSoundIcon").hide();
            $("#animalSoundPlaceholder").show();
        }
    }
});