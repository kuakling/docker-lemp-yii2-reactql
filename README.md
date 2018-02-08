1. เปลี่ยนชื่อไฟล์ .env-sample เป็น .env และเปลี่ยนค่าต่างๆภายในนั้น

2. Build Dockerfile ทั้งหมด
	sudo docker-compose build

3. Start container ทั้งหมด
	sudo docker-compose up -d

4. ติดตั้ง Yii2
	4.1 Clone Yii2-Advanced template ลงใน /web/yii2
		git clone https://github.com/yiisoft/yii2-app-advanced.git ./web/yii2
	4.2 Initial Yii2 project เลือก 0 สำหรับ Development หรือ 1 สำหรับ Production
		sudo docker-compose run --rm php ./init
	4.3 ติดตั้ง dependencies ทั้งหมด
		sudo docker-compose run --rm php composer install
	4.4 เปลี่ยนค่าการเชื่อมต่อฐานข้อมูลในไฟล์ web/yii2/common/config/main-local.php
```php
return [
    'components' => [
        'db' => [
            'class' => 'yii\db\Connection',
            'dsn' => 'mysql:host=mysql;dbname=dev_db', 
            // host = .env --> MYSQL_HOST
            // dbname = .env -> MYSQL_DATABASE
            'username' => 'dev', // .env -> MYSQL_USER
            'password' => 'dev', // .env -> MYSQL_PASSWORD
            'charset' => 'utf8',
        ],
	...
    ],
];
```
  4.5 Migrate database
```
sudo docker-compose run --rm php ./yii migrate
```

5. ติดตั้ง reactql ด้วย 
```
git clone https://github.com/reactql/kit.git ./web/reactql
```
  ปรับแก้อะไรไปบ้าง ดูตามนี้เลย
  5.1 web/api/reactql/kit/webpack/server_prod.js
    #L68: BASE_URL: JSON.stringify(process.env.BASE_URL || '/'), //เพิ่มบรรทัดนี้เข้าไปใต้บรรทัดของ SSL_PORT

  5.2 web/api/reactql/kit/webpack/browser_prod.js
    #L61: filename: 'bundle/assets/css/style.[contenthash].css', //เพิ่ม bundle/ ไปด้านหน้า
    #L81: filename: 'bundle/[name].[chunkhash].js',
    #L82: chunkFilename: 'bundle/[name].[chunkhash].js',
    #L105: BASE_URL: JSON.stringify(process.env.BASE_URL || '/'), //เพิ่มบรรทัดนี้เข้าไปใต้บรรทัดของ SSL_PORT
    #L190: to: join(PATHS.public, 'static'), //เพิ่มบรรทัดนี้เข้าไปใน CopyWebpackPlugin ใต้บรรทัด from: PATHS.static,

  5.3 web/api/reactql/kit/entry/browser.js
    #L22: import { BrowserRouter as Router } from 'react-router-dom';
    #L76: <Router history={history} basename={process.env.BASE_URL}> // เพิ่ม basename={process.env.BASE_URL}

  5.4 web/api/reactql/kit/entry/server.js
    #L161: <StaticRouter location={ctx.request.url} context={routeContext} basename={process.env.BASE_URL}>  // เพิ่ม basename={process.env.BASE_URL}

  5.5 web/api/reactql/kit/views/ssr.js
    #L21: {helmet.base.toString() ? helmet.base.toComponent() : <base href={`${process.env.BASE_URL}/`} />} // เปลี่ยนจาก <base href="/" /> เป็น <base href={`${process.env.BASE_URL}/`} />

  5.6 web/api/reactql/kit/webpack/base.js
    #L66: name: 'bundle/assets/fonts/[name].[hash].[ext]', //เพิ่ม bundle/ ไปด้านหน้า
    #L79: name: 'bundle/assets/img/[name].[hash].[ext]',

6. Build ด้วยคำสั่ง sudo docker-compose build

7. Run ด้วยคำสั่ง sudo docker-compose up -d

การรันข้แ 6-7 อาจใช้เวลานาน หากต้องการรวบในการสั่งทีเดียวก็ให้ใช้คำสั่งนี้ sudo docker-compose build && sudo docker-compose up -d

--------------------------------------------------

Routes
1. http://localhost		            = nginx yii2 frontend
2. http://localhost/office	      = nginx yii2 backend
3. http://localhost/phpmyadmin/	  = phpmyadmin
4. http://localhost/api		        = nodejs restfull
5. http://localhost/sub_folder    = nodejs react universal by reactql.org
6. http://localhost:8888	        = manage docker on web base

Backgrounds
1. web              = Routing control             Global port 80, 443
2. php              = Compiler php v.7 		        Private port 9000
3. mysql            = Mariadb service		          Private port 3306
4. mongodb          = Mongodb service		          Private port 27017
5. memcached        = Memcache			              Private port 11211
6. templates        = Template for portainer	    Private
7. watchtower       = manage user for portainer	  Private



logs.
เนื่องจาก reactql ถูกออกแบบมาให้รันภายใต้ root url ถึงแม้เราจะใส่ basename ใน BrowserRouter แล้วก็ตาม แต่ไฟล์ที่ถูก Build ก็ยังยังถูเรียกจาก root url อยู่ดี แต่ในความต้องการของผู้จัดทำต้องการให้มันการเรียกไฟล์ดังกล่าวภายใต้ /sub_folder/bundle สำหรับไฟล์ที่ build และ /sub_folder/static สำหรับไฟลที่ถูกคัดลองมาจาก [root]/static จึงได้ใช้วิธีการดังนี้
  1. สร้าง location /sub_folder แล้วให้ proxy_pass ไปที่ container ของ reactql
  2. ปรับโค๊ดเพื่อ reactql มัน build ลงไปในโฟลเดอร์ที่ซ้อนอยูใน public อีกที (ในที่นี้ตั้งชื่อโฟลเดอร์ว่า bundle)
  3. map volume โฟลเดอร์ public ให้เป็นโฟลเดอร์หนึงใน container ของ proxy ที่ไฟล์ docker-compose.yml
    ```
      web:
        ...
        volumes:
          ...
          - "./web/reactql/dist/public:/var/www/reactql"
    ```
  4. แก้ไข config ของ nginx โดยเพิ่ม location /sub_folder/bundle มองไปไทีโฟลเดอร์ที่ map มาในข้อ 3.
  การกำหนดค่าของ proxy โดยให้ location /sub_folder/bundle ให้มองไปที่โฟลเดอร์ /var/www/html/reactql/bundle และ /sub_folder/static ให้มองไปที่โฟลเดอร์ /var/www/html/reactql/static
  ```
  // หากมีการเปลี่ยนชื่อ sub_folder (ซึงก็คงไม่มีไครใช้ชื่อนี้เนอะ) ในไฟล์ .env ไปเป็นชื่ออื่นก็ให้เปลี่ยน config ของ nginx ในนี้ตามไปด้วย
  location /sub_folder {
    proxy_pass http://reactql:4000;

    # Disable run php file
    location ~ ^/sub_folder/.+\.php(/|$) {
      deny all;
    }
  }

  location /sub_folder/bundle {
    alias /var/www/reactql/bundle;
  }

  location /sub_folder/static {
    alias /var/www/reactql/static;
  }
  ```

  เมื่อเสร็จ 4 ขั้นตอนนี้ เราก็จะมี url /sub_folder และ /sub_folder/bundle และ /sub_folder/static ถ้ามองผ่านๆ ก็เหมือน static ไฟล์ธรรมดาเนอะ แต่จริงๆ แล้ว /sub_folder จะถูกให้บริการโดย NodeJs + Koa2 แต่ /sub_folder/bundle และ /sub_folder/static จะถูกให้บริการด้วย nginx



