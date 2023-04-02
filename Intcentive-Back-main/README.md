# Track Tire
### We make repair services easy
# ระบบบริหารจัดการยางยนต์ และ บำรุงรักษา

# Convention Web UI
## Common Convention
- โค้ดการทำงานหนึ่งบรรทัด ใส่ Semi-colon `;`
```
console.log(this.test);
```

## Function And Parameter Naming Conventions
- ส่วนที่เกี่ยวข้องกับ UI(component) จะใช้รูปแบบการตั้งชื่อแบบ **UperCamelCase ขึ้นต้นต้วยตัวพิมพ์ใหญ่**

- ส่วนที่เป็นการคำนวน จะใช้รูปแบบการตั้งชื่อแบบ **snake_case ตั้งชื่อตัวแปรโดยมี _(Underscore) เป็นตัวคั่นคำ ตัวพิมพ์เล็กทั้งหมด**
```
func Homepage() //UI 
const IconCards = () => {}

func calculate_total_price() //logic
```

## HTML Element ID 
- จะใช้รูปแบบการตั้งชื่อแบบ **snake_case ตั้งชื่อตัวแปรโดยมี _(Underscore) เป็นตัวคั่นคำ ตัวพิมพ์เล็กทั้งหมด**
```
receiver_name
total_amount
```

## Directory Name
- ใช้ตัวอักษรพิมพ์เล็กทั้งหมด เช่น 
```
order
productpice **lower case ตัวพิมพ์เล็กทั้งหมด**
```

## File Name
- ใช้รูปแบบการตั้งชื่อฟังก์ชั่นแบบ (Ui) **UpperCamelCase ขึ้นต้นต้วยตัวพิมพ์ใหญ่**
```
Order.js
ThemeColors.js
Shipping.test.js
```
- ใช้รูปแบบการตั้งชื่อฟังก์ชั่นแบบ (func) **UpperCamelCase ขึ้นต้นต้วยตัวพิมพ์ใหญ่**

```
authHelper.js
reducers.js
Shipping.test.js
```

## Test Name
- ใช้รูปแบบการตั้งชื่อให้สื่อความหมาย  เช่น
```
describe('calculate_total_price', () => {
test('Input 5+8 should be 13',()=>{
        const expected = 13;
        const productPriceList = ["5","8"];
        const actual = CalculateTotalPrice(productPriceList);
        expect(actual).toEqual(expected);
    });
}
```

## Variable Name
- ชื่อตัวแปรเป็นคำเดียวให้ตั้งชื่อเป็นพิมพ์เล็กทั้งหมด เช่น
```
day, month, year
```

- ชื่อตัวแปรมีความยาวตั้งแต่ 2 คำขึ้นไป ให้คำหลังขึ้นตันด้วยตัวอักษรตัวใหญ่เสมอ ในรูปแบบ **camelCase** เช่น
```
  forgotUserMail, newPassword, resetPasswordCode
```

- ชื่อตัวแปรเก็บค่าให้เติม "List" ต่อท้ายตัวแปรเสมอ เช่น
```
order // เม้าส์
ordeList //[เม้าส์ ,คีย์บอร์ด]
```
---
## การตั้งชื่อ redux and reducer
- ชื่อตัว func ด้วย **camelCase**
- ชื่อตัว type ด้วย คำธิบายการทำงาน **UPPER_SNAKE_CASE**
- ชื่อตัว payload ด้วย **camelCase**

```
export const forgotPasswordSuccess = (forgotUserMail) => ({
  type: FORGOT_PASSWORD_SUCCESS,
  payload: forgotUserMail,
});
```

# Convention Web Service
## Function And Parameter Naming Conventions
- ใช้รูปแบบการตั้งชื่อฟังก์ชั่นแบบ **camelCase ตั้งชื่อตัวแปรโดยขึ้นต้นด้วยตัวพิมพ์เล็ก เเละคำตามหลัง ขึ้นต้นต้วยตัวพิมพ์ใหญ่**
```
func forgotUserMail()
```

## Directory Name (Folder)
- ใช้ตัวอักษรพิมพ์เล็กทั้งหมด เช่น
```
order
product
```

## File Name
- camelCase ขึ้นต้นด้วยตัวใหญ่ เช่น
```
OrderService.js
ProductRepository.js
OrderServiceTest.js
```

## Service Name
- ใช้ตัวอักษรพิมพ์เล็กทั้งหมด เช่น
```
order
product
```

## Test Function Name
- ใช้รูปแบบการตั้งชื่อฟังก์ชันเป็นแบบ **snake_case** เช่น
```
test_calculate_age_input_birth_date_18042003_should_be_16
```

## Variable Name
- ชื่อตัวแปรเป็นคำเดียวให้ตั้งชื่อเป็นพิมพ์เล็กทั้งหมด เช่น
```
day, month, year
```

- ชื่อตัวแปรมีความยาวตั้งแต่ 2 คำขึ้นไป ให้คำหลังขึ้นตันด้วยตัวอักษรตัวใหญ่เสมอ ในรูปแบบ **snake_case** เช่น
```
start_day, end_month
```

- ชื่อตัวแปรเก็บค่าให้เติม "list" ต่อท้ายตัวแปรเสมอ เช่น
```
order // เม้าส์
order_list //[เม้าส์ ,คีย์บอร์ด]
```


----


## ข้อตกลง Commit Message ร่วมกัน
```
[Created]: สร้างไฟล์ใหม่สำหรับ...
[Edited]: แก้ไข code ในไฟล์เดิมที่มีอยู่แล้ว รวมถึงกรณี refactor code
[Added]: กรณีเพิ่ม function, function test ใหม่เข้ามา
[Deleted]: ลบไฟล์ออก 'ชื่อไฟล์' เนื่องจาก...
* ให้เขียนรายละเอียดด้วยว่าแก้ไขอะไรและทำที่ตรงไหน
```

## How to run Acceptance test (API and UI)
# bash /root/PMRP_SERVICE_STARTUP/rawmatInOutCTS_startUp.sh
### API test


### UI test

### UI DOCUMENT 
# https://gogo-react-docs.coloredstrategies.com/docs/guides


### Service Deploy Producting
```
[Command]:bash /root/PMRP_SERVICE_STARTUP/save_yang_system_management_startUp.sh
```
## New Service Deploy
```
[Command]:bash /root/SaveYang_service/save_yang_system_management/docker/newInstall.sh
```
## ReInstall Deploy
```

[Prepare]:
1. เปลี่ยน Version ที่  "GET home page." ใน \app\routes\index.js
2. npm run build (ที่ localhost version ตามที่ต้องการ)
3. ทำการ git pust เพื่อ pust update main.js เข้าที่ github
4. เข้าที่ Server linux Backend
5. [run Command]:bash /root/SaveYang_service/save_yang_system_management/docker/reInstall.sh
```


### Service Deploy test
```
[Command]:bash /root/PMRP_SERVICE_STARTUP/save_yang_system_management_startUp_test.sh
```
## New Service Deploy test
```
[Command]:bash /root/SaveYang_service/save_yang_system_management/docker/newInstall_test.sh
```
## ReInstall Deploy test
```

[Prepare]:
1. เปลี่ยน Version ที่  "GET home page." ใน \app\routes\index.js
2. npm run build (ที่ localhost version ตามที่ต้องการ)
3. ทำการ git pust เพื่อ pust update main.js เข้าที่ github
4. เข้าที่ Server linux Backend
5. [run Command]:bash /root/SaveYang_service_test/save_yang_system_management/docker/reInstallTest.sh
```



