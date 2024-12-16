from pymongo import MongoClient

# Kết nối tới MongoDB
# client = MongoClient("mongodb+srv://zunpom2209:minhhieu31122004@cluster0.aqc7n.mongodb.net/")
client = MongoClient("mongodb://localhost:27017/")

# Chọn database và collection
# db = client["AnimalDatabase"]
# collection = db["Animals"]
db = client["Python"]
collection = db["animals"]

# Lấy tất cả tên động vật (Name_Eng) và đếm tổng số tài liệu
animal_names = collection.find({}, {"_id": 0, "Name_Eng": 1})
total_animals = collection.count_documents({})

# In ra danh sách tên động vật với số thứ tự
print("Danh sách các tên động vật (English):")
for index, animal in enumerate(animal_names, start=1):
    print(f"{index}. {animal['Name_Eng']}")

# In tổng số lượng tài liệu
print(f"Tổng số động vật trong bảng: {total_animals}")
