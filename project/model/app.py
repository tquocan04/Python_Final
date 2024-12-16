from json import dumps
from flask import Flask, request, jsonify, render_template, send_from_directory
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import os
from query import get_animal_by_class_id, get_all_animal

# Tạo Flask app
app = Flask(__name__, static_folder="static", template_folder="templates")

# Tải model tại startup
try:
    model = load_model('model.h5')
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {str(e)}")
    raise

# Thư mục tải lên
upload_folder = './uploads'
os.makedirs(upload_folder, exist_ok=True)

def preprocess_image(img_path):
    try:
        img = image.load_img(img_path, target_size=(224, 224))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array /= 255.0  # Chuẩn hóa
        return img_array
    except Exception as e:
        raise ValueError(f"Error in preprocessing image: {str(e)}")

# Route chính để phục vụ giao diện HTML
@app.route('/')
def index():
    return render_template('mainPage.html')
@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/upload')
def upload():
    return render_template('upload.html')

@app.route('/all-animals', methods=['GET'])
def getAll():
    animal_info = get_all_animal()
    
    # Kiểm tra nếu có dữ liệu
    if animal_info:
        # Chuyển cursor thành danh sách
        # Nếu bạn muốn trả về kết quả dưới dạng JSON hợp lệ, bạn có thể sử dụng dumps từ bson.json_util
        return list(animal_info), 200
    else:
        return jsonify({"message": "No animals found"}), 404

# API xử lý dự đoán
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        # Lưu file
        img_path = os.path.join(upload_folder, file.filename)
        file.save(img_path)
        print(f"File saved at: {img_path}")

        # Xử lý hình ảnh
        img_array = preprocess_image(img_path)
        print("Image preprocessed successfully.")

        # Dự đoán với model
        predictions = model.predict(img_array)
        print(f"Predictions: {predictions}")

        # Lấy lớp dự đoán
        predicted_class = np.argmax(predictions[0])
        confidence = predictions[0][predicted_class]
        print(f"Predicted class: {predicted_class}, Confidence: {confidence}")

        # Tên các lớp
        class_names = [
            'Ant', 'Antelope', 'Bear', 'Bee', 'Beetle', 'Bull', 'Butterfly', 'Camel',
            'Cat', 'Chicken', 'Crocodile', 'Dog', 'Duck', 'Elephant', 'Fish', 'Frog',
            'Giraffe', 'Goat', 'Horse', 'Kangaroo', 'Leopard', 'Lion', 'Monkey', 'Mouse',
            'Penguin', 'Pig', 'Rabbit', 'Snail', 'Snake', 'Spider', 'Tiger', 'Tortoise', 'Zebra'
        ]
        predicted_class_name = class_names[predicted_class]

        # Lấy thông tin từ Firebase
        animal_info = get_animal_by_class_id(int(predicted_class + 1))

        if not animal_info:
            print(f"No animal info found for class_id: {predicted_class + 1}")
            return jsonify({
                "predicted_class": predicted_class_name,
                "confidence": float(confidence) * 100,
                "animal_info": {
                    "Name_Eng": "Không tìm thấy",
                    "Name_Vie": "Không tìm thấy",
                    "mo_ta": f"Không có thông tin chi tiết cho class_id {predicted_class + 1}",
                    "sound_url": None
                }
            }), 404

        # Trả kết quả
        return jsonify({
            "predicted_class": predicted_class_name,
            "confidence": float(confidence) * 100,
            "animal_info": animal_info
        })

    except Exception as e:
        print(f"Error in /predict: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Đường dẫn để xử lý file tĩnh (CSS, JS, hình ảnh, v.v.)
@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True)
