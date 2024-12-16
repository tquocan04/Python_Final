from pymongo import MongoClient

# Kết nối tới MongoDB
client = MongoClient("mongodb://localhost:27017/")

# Chọn database và collection
db = client['Python']  
animal_collection = db['animals']  

def get_animal_by_class_id(class_id):
    try:
        # Truy vấn document theo class_id
        animal = animal_collection.find_one({"class_id": class_id})
        if animal:
            return {
                "Name_Eng": animal.get("Name_Eng", "Unknown"),
                "Name_Vie": animal.get("Name_Vie", "Không rõ"),
                "mo_ta": animal.get("mo_ta", "Không có thông tin chi tiết"),
                "sound_url": animal.get("sound_url", "Không có tiếng kêu "),
                "img": animal.get("img", "")
            }
        return None
    except Exception as e:
        print(f"Error querying MongoDB: {str(e)}")
        return None


def get_all_animal():
    try:
        animal = animal_collection.find()
        if animal:
            result = []
            for doc in animal:
                doc['_id'] = str(doc['_id'])  # Chuyển ObjectId thành chuỗi
                result.append(doc)
            return result
        return None
    except Exception as e:
        print(f"Error querying MongoDB: {str(e)}")
        return None