from dotenv import load_dotenv

load_dotenv()

class clientVO:
    def __init__(self, user_id: int, sub_plan: str, name: int, surname: int, address: str, city: str, postal_code: str, dni: str, phone_number: str, 
                available_credits: int = None, id: int = None):

        if not user_id or not sub_plan:
            raise ValueError("user_id and sub_plan are required fields")
        
        self.__id = id
        self.user_id = user_id
        self.sub_plan = sub_plan
        self.name = name
        self.surname = surname
        self.address = address
        self.city = city
        self.postal_code = postal_code
        self.dni = dni
        self.phone_number = phone_number
        self.available_credits = available_credits

    @property
    def id(self):
        return self.__id