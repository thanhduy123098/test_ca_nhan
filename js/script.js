// ============================================================
//  script.js — Logic xử lý (render, validate...)
// ============================================================

// Hàm 1: Render danh sách sản phẩm ra trang san-pham.html
// Thêm tham số thuongHieu với giá trị mặc định là "all"
function renderDanhSachSanPham(thuongHieu = "all") {
    const productListDiv = document.getElementById("product-list");
    if (!productListDiv) return;

    // Xóa nội dung cũ
    productListDiv.innerHTML = "";

    // Lấy toàn bộ sản phẩm active từ database
    let sanPhamActive = getSanPhamActive();

    // LOGIC LỌC DỮ LIỆU: Nếu người dùng chọn một hãng cụ thể (khác "all")
    if (thuongHieu !== "all") {
        // Chỉ giữ lại các sản phẩm có thuộc tính thuongHieu trùng khớp
        sanPhamActive = sanPhamActive.filter(sp => sp.thuongHieu === thuongHieu);
    }

    // Nếu hãng đó không có sản phẩm nào
    if (sanPhamActive.length === 0) {
        productListDiv.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 30px; color: #dc2626; font-weight: bold;">Không tìm thấy sản phẩm nào thuộc hãng này.</p>';
        return;
    }

    // Vòng lặp render sản phẩm (Giữ nguyên như cũ của bạn)
    sanPhamActive.forEach(sp => {
        const card = document.createElement("div");
        card.className = "card";
        
        card.innerHTML = `
            <img src="${sp.hinhAnh[0]}" alt="${sp.ten}">
            <div class="card-body">
                <h3>${sp.ten}</h3>
                <div class="price">${formatGia(sp.gia)}</div>
                <a href="chi-tiet.html?id=${sp.id}" class="btn">Xem chi tiết</a>
            </div>
        `;
        productListDiv.appendChild(card);
    });
}

// ============================================================
// Hàm 2: Render Chi Tiết Sản Phẩm (trang chi-tiet.html)
// ============================================================
function renderChiTietSanPham() {
    const detailContent = document.getElementById("detail-content");
    const errorMessage = document.getElementById("error-message");

    // Nếu không ở trang chi tiết thì bỏ qua
    if (!detailContent) return;

    // 1. Lấy ID từ URL (Query String)
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');

    // 2. Kiểm tra nếu không có ID trên URL
    if (!idParam) {
        errorMessage.style.display = "block";
        return;
    }

    // 3. Tìm sản phẩm trong db.js dựa vào ID
    const product = getSanPhamById(idParam);

    // 4. Nếu không tìm thấy sản phẩm (ID sai, hoặc sản phẩm đã bị xóa)
    if (!product || product.trangThai === "hidden") {
        errorMessage.style.display = "block";
        return;
    }

    // 5. Nếu tìm thấy, render HTML chi tiết
    // Cấu trúc 2 cột: Ảnh bên trái, Thông tin bên phải. Khối mô tả ở dưới.
    detailContent.innerHTML = `
        <div class="detail-container">
            <div class="detail-image">
                <img src="${product.hinhAnh[0]}" alt="${product.ten}">
            </div>
            <div class="detail-info">
                <h1>${product.ten}</h1>
                <div class="detail-price">${formatGia(product.gia)}</div>
                
                <p><strong>Thương hiệu:</strong> ${product.thuongHieu}</p>
                <p><strong>Tình trạng:</strong> Mới 100%</p>
                <p><strong>Bảo hành:</strong> ${product.baoHanh}</p>
                <p style="margin-top: 15px; color: #475569;">${product.moTa}</p>
                
                <div style="margin-top:20px; display:flex; gap:10px; flex-wrap:wrap;">
    <button class="btn" onclick="muaNgay(${product.id})">
        Mua ngay
    </button>

    <button class="btn btn-warning" onclick="themVaoGio(${product.id})">
        Thêm vào giỏ hàng
    </button>
</div>

<div id="gioHangContainer" style="margin-top:20px;"></div>
<div id="formDatHangContainer" style="margin-top:20px;"></div>
            </div>
        </div>

        <div style="margin-top: 30px; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h3 style="border-bottom: 2px solid #f4f6f9; padding-bottom: 10px; margin-bottom: 15px;">Thông tin chi tiết</h3>
            <p>${product.noiDung}</p>
        </div>
    `;
    
    // Cập nhật thẻ title của trình duyệt theo tên sản phẩm cho chuyên nghiệp
    document.title = product.ten + " - PhoneParts Studio";
    hienThiGioHang();
}

// ... (Giữ nguyên các hàm renderDanhSachSanPham và renderChiTietSanPham ở trên) ...

// ============================================================
// Hàm 3: Xử lý và Validate Form Liên Hệ (trang lien-he.html)
// ============================================================
function xuLyFormLienHe() {
    const contactForm = document.getElementById("contactForm");
    const formMessage = document.getElementById("formMessage");

    // Nếu không ở trang liên hệ thì bỏ qua hàm này
    if (!contactForm) return;

    contactForm.addEventListener("submit", function(event) {
        // Ngăn chặn hành vi tải lại trang mặc định của form
        event.preventDefault();

        // Lấy giá trị người dùng nhập vào
        const hoTen = document.getElementById("hoTen").value.trim();
        const email = document.getElementById("email").value.trim();
        const soDienThoai = document.getElementById("soDienThoai").value.trim();
        const loaiTuVan = document.getElementById("loaiTuVan").value;
        const loiNhan = document.getElementById("loiNhan").value.trim();

        // Đặt mặc định khung thông báo sẽ hiển thị
        formMessage.style.display = "block";

        // 1. Kiểm tra bỏ trống
        if (hoTen === "" || email === "" || soDienThoai === "" || loiNhan === "") {
            formMessage.style.color = "#dc2626"; // Màu đỏ báo lỗi
            formMessage.innerText = "❌ Vui lòng nhập đầy đủ các trường bắt buộc (*).";
            return; // Dừng lại không chạy tiếp
        }

        // 2. Kiểm tra định dạng Email (yêu cầu cơ bản: phải có chữ @)
        if (!email.includes("@")) {
            formMessage.style.color = "#dc2626";
            formMessage.innerText = "❌ Email không hợp lệ (phải chứa ký tự @).";
            return;
        }

        // 3. Kiểm tra định dạng Số điện thoại (yêu cầu cơ bản: phải là số)
        if (isNaN(soDienThoai)) {
            formMessage.style.color = "#dc2626";
            formMessage.innerText = "❌ Số điện thoại chỉ được chứa các chữ số.";
            return;
        }

        // Nếu vượt qua tất cả các bài kiểm tra trên -> Hợp lệ
        formMessage.style.color = "#15803d"; // Màu xanh lá báo thành công
        formMessage.innerText = "✅ Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.";

        // Xóa sạch form sau khi gửi thành công
        contactForm.reset();
    });
}

// ... (Giữ nguyên các Hàm 1, 2, 3 ở trên) ...

// ============================================================
// Hàm 4: Xử lý Trang Quản Lý Admin (Thêm, Sửa, Xóa mềm)
// ============================================================
function xuLyTrangAdmin() {
    const adminTableBody = document.getElementById("adminTableBody");
    const adminForm = document.getElementById("adminForm");
    
    // Nếu không ở trang quản lý thì bỏ qua hàm này
    if (!adminTableBody || !adminForm) return;

    let currentEditId = null; // Biến lưu vết xem đang Thêm mới hay Sửa
    const btnSubmit = document.getElementById("btnSubmitAdmin");
    const btnCancel = document.getElementById("btnCancelEdit");

    // --- A. HIỂN THỊ BẢNG SẢN PHẨM ---
    function renderAdminTable() {
        adminTableBody.innerHTML = "";
        const tatCaSP = getAllSanPham(); // Lấy từ db.js (cả active và hidden)

        tatCaSP.forEach(sp => {
            const tr = document.createElement("tr");
            
            // Xác định class và text cho nhãn trạng thái
            const badgeClass = sp.trangThai === "active" ? "badge badge-active" : "badge badge-hidden";
            const badgeText = sp.trangThai === "active" ? "Đang bán" : "Tạm ẩn";

            // Tạo các nút hành động (Nếu đang bán thì hiện nút Ẩn, nếu đang ẩn thì hiện nút Khôi phục)
            const actionButtons = `
                <button class="btn btn-warning" onclick="editSP(${sp.id})" style="margin-bottom: 5px; padding: 5px 10px;">Sửa</button>
                ${sp.trangThai === 'active' 
                    ? `<button class="btn btn-danger" onclick="deleteSP(${sp.id})" style="padding: 5px 10px;">Ẩn</button>` 
                    : `<button class="btn" onclick="restoreSP(${sp.id})" style="background: #15803d; padding: 5px 10px;">Hiện</button>`}
            `;

            tr.innerHTML = `
                <td>${sp.id}</td>
                <td><img src="${sp.hinhAnh[0] || 'https://placehold.co/100x100'}" class="admin-image" alt="IMG"></td>
                <td style="text-align: left; font-weight: bold;">${sp.ten}</td>
                <td class="price">${formatGia(sp.gia)}</td>
                <td><span class="${badgeClass}">${badgeText}</span></td>
                <td>${actionButtons}</td>
            `;
            adminTableBody.appendChild(tr);
        });
    }

    // --- B. XÓA MỀM VÀ KHÔI PHỤC (Gắn vào global window để gọi từ HTML) ---
    window.deleteSP = function(id) {
        if (confirm("Bạn có chắc muốn tạm ẩn sản phẩm này khỏi cửa hàng?")) {
            xoaMemSanPham(id); // Gọi hàm trong db.js
            renderAdminTable(); // Load lại bảng
        }
    }

    window.restoreSP = function(id) {
        khoiPhucSanPham(id);
        renderAdminTable();
    }

    // --- C. ĐƯA DỮ LIỆU LÊN FORM ĐỂ SỬA ---
    window.editSP = function(id) {
        const sp = getSanPhamById(id);
        if(!sp) return;

        // Đổ dữ liệu vào input
        document.getElementById("adTen").value = sp.ten;
        document.getElementById("adGia").value = sp.gia;
        document.getElementById("adThuongHieu").value = sp.thuongHieu || "";
        document.getElementById("adHinhAnh").value = sp.hinhAnh[0] || "";
        document.getElementById("adMoTa").value = sp.moTa || "";

        // Chuyển trạng thái Form sang chế độ Cập nhật
        currentEditId = id;
        btnSubmit.innerText = "Cập nhật sản phẩm";
        btnCancel.style.display = "inline-block";
        
        // Cuộn mượt mà xuống khu vực Form
        document.getElementById("adminForm").scrollIntoView({ behavior: 'smooth' });
    }

    // Nút hủy sửa
    btnCancel.addEventListener("click", function() {
        adminForm.reset();
        currentEditId = null;
        btnSubmit.innerText = "Thêm sản phẩm mới";
        this.style.display = "none";
    });

    // --- D. XỬ LÝ SUBMIT FORM (Thêm mới hoặc Cập nhật) ---
    adminForm.addEventListener("submit", function(e) {
        e.preventDefault();

        // Lấy dữ liệu
        const ten = document.getElementById("adTen").value;
        const gia = parseInt(document.getElementById("adGia").value);
        const thuongHieu = document.getElementById("adThuongHieu").value;
        const hinhAnh = [document.getElementById("adHinhAnh").value || "https://placehold.co/600x400"];
        const moTa = document.getElementById("adMoTa").value;

        if (currentEditId) {
            // ĐANG SỬA
            capNhatSanPham(currentEditId, { ten, gia, hinhAnh, moTa, thuongHieu });
            alert("Cập nhật thành công!");
            
            // Trả form về như cũ
            currentEditId = null;
            btnSubmit.innerText = "Thêm sản phẩm mới";
            btnCancel.style.display = "none";
        } else {
            // ĐANG THÊM MỚI
            themSanPham({
                ten, gia, hinhAnh, moTa, thuongHieu,
                loai: "khac", tenLoai: "Mới", trangThai: "active",
                noiDung: "Nội dung chi tiết đang được cập nhật...", baoHanh: "Bảo hành tiêu chuẩn"
            });
            alert("Thêm sản phẩm thành công!");
        }

        adminForm.reset();
        renderAdminTable(); // Load lại bảng
    });

    // Khởi chạy render bảng lần đầu tiên
    renderAdminTable();
}

// ============================================================
// CẬP NHẬT: Sự kiện chạy tự động khi tải trang (Gộp chung tất cả)
// ============================================================
window.onload = function() {
    renderDanhSachSanPham();
    renderChiTietSanPham();
    hienThiGioHang();
    xuLyFormLienHe();
    xuLyTrangAdmin(); // <-- Gọi thêm hàm xử lý trang quản lý
};


// =====================================================
// GIỎ HÀNG
// =====================================================

let GIO_HANG = JSON.parse(localStorage.getItem("GIO_HANG")) || [];

function luuGioHang() {
    localStorage.setItem("GIO_HANG", JSON.stringify(GIO_HANG));
}

function themVaoGio(id) {

    const sp = getSanPhamById(id);

    if (!sp) return;

    GIO_HANG.push(sp);

    luuGioHang();

    hienThiGioHang();

    alert("Đã thêm vào giỏ hàng!");
}

function xoaKhoiGio(index) {

    GIO_HANG.splice(index, 1);

    luuGioHang();

    hienThiGioHang();
}

function hienThiGioHang() {

    const container =
        document.getElementById("gioHangContainer");

    if (!container) return;

    if (GIO_HANG.length === 0) {

        container.innerHTML = `
            <h3>Giỏ hàng</h3>
            <p>Chưa có sản phẩm nào.</p>
        `;

        return;
    }

    let html = `
        <h3>Giỏ hàng</h3>

        <table>
            <tr>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Hành động</th>
            </tr>
    `;

    GIO_HANG.forEach((sp, index) => {

        html += `
            <tr>
                <td>${sp.ten}</td>
                <td>${formatGia(sp.gia)}</td>

                <td>
                    <button
                        class="btn btn-danger"
                        onclick="xoaKhoiGio(${index})">
                        Loại bỏ khỏi giỏ hàng
                    </button>
                </td>
            </tr>
        `;
    });

    html += "</table>";

    container.innerHTML = html;
}

// =====================================================
// MUA NGAY
// =====================================================

function muaNgay(id) {

    const sp = getSanPhamById(id);

    const container =
        document.getElementById("formDatHangContainer");

    if (!container || !sp) return;

    container.innerHTML = `
        <form id="formDatHang">

            <h3>Thông tin đặt hàng</h3>

            <div class="form-group">
                <label>Họ tên</label>
                <input type="text" id="dhHoTen" required>
            </div>

            <div class="form-group">
                <label>Số điện thoại</label>
                <input type="text" id="dhSDT" required>
            </div>

            <div class="form-group">
                <label>Email</label>
                <input type="email" id="dhEmail">
            </div>

            <div class="form-group">
                <label>Địa chỉ nhận hàng</label>
                <textarea id="dhDiaChi"></textarea>
            </div>

            <div class="form-group">
                <label>Ghi chú</label>
                <textarea id="dhGhiChu"></textarea>
            </div>

            <div class="form-group">
                <label>Sản phẩm</label>

                <input
                    type="text"
                    value="${sp.ten}"
                    readonly>
            </div>

            <button type="submit" class="btn">
                Đặt hàng
            </button>

        </form>
    `;

    document
        .getElementById("formDatHang")
        .addEventListener("submit", function(e) {

            e.preventDefault();

            alert(
                "Đặt hàng thành công!\n\n" +
                "Sản phẩm: " + sp.ten
            );

            this.reset();
        });
}

// ============================================================
// KIỂM TRA MẬT KHẨU ADMIN
// ============================================================

function kiemTraAdmin() {

    const matKhau = prompt(
        "Nhập mật khẩu Admin:"
    );

    if (matKhau === null) {
        return;
    }

    if (matKhau === "123456") {

        window.location.href =
            "quan-ly.html";

    } else {

        alert("Sai mật khẩu!");

    }
}

// ============================================================
// ĐĂNG NHẬP ADMIN
// ============================================================

function kiemTraAdmin() {

    const modal =
        document.getElementById("adminModal");

    if (modal) {
        modal.style.display = "flex";
    }
}

function dongAdminModal() {

    const modal =
        document.getElementById("adminModal");

    if (modal) {
        modal.style.display = "none";
    }
}

function xacNhanAdmin() {

    const password =
        document.getElementById("adminPassword").value;

    if (password === "123456") {

        window.location.href =
            window.location.pathname.includes("/html/")
            ? "quan-ly.html"
            : "html/quan-ly.html";

    } else {

        alert("Sai mật khẩu!");

    }
}