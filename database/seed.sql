BEGIN;

INSERT INTO users (id, full_name, email, phone, password_hash, role) VALUES
('00000000-0000-0000-0000-000000000001','Daniela López','daniela@example.com','5550000001','$2b$12$example.tutor','tutor'),
('00000000-0000-0000-0000-000000000002','Mariana Rivera','mariana@example.com','5550000002','$2b$12$example.provider','provider'),
('00000000-0000-0000-0000-000000000003','Administrador Calli Pet','admin@callipet.local',NULL,'$2b$12$example.admin','admin');

INSERT INTO user_addresses
(id,user_id,label,street,alcaldia,postal_code,latitude,longitude,is_primary) VALUES
('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001',
'Casa','Av. Universidad 1000','Benito Juárez','03330',19.371900,-99.174800,TRUE);

INSERT INTO pets
(id,owner_id,name,species,breed,sex,birth_date,weight_kg,notes) VALUES
('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001',
'Luna','perro','Mestiza','F','2022-04-15',14.50,'Sociable y con vacunas vigentes.');

INSERT INTO providers
(id,owner_user_id,commercial_name,provider_type,description,verified,rating_avg,alcaldia,latitude,longitude) VALUES
('30000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',
'Veterinaria Calli Centro','veterinaria','Consulta preventiva y seguimiento general.',
TRUE,4.80,'Benito Juárez',19.381800,-99.177200);

INSERT INTO services
(id,name,category,description,base_duration_minutes) VALUES
('40000000-0000-0000-0000-000000000001','Consulta veterinaria general','Veterinaria','Evaluación general.',45),
('40000000-0000-0000-0000-000000000002','Grooming básico','Grooming','Baño y cepillado.',90),
('40000000-0000-0000-0000-000000000003','Paseo individual','Paseo','Paseo con evidencia.',60),
('40000000-0000-0000-0000-000000000004','Cuidado a domicilio','Cuidado','Visita programada.',60);

INSERT INTO provider_services
(provider_id,service_id,price,duration_minutes,home_service) VALUES
('30000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001',550,45,FALSE);

INSERT INTO provider_availability
(provider_id,weekday,start_time,end_time,max_capacity) VALUES
('30000000-0000-0000-0000-000000000001',1,'09:00','18:00',8),
('30000000-0000-0000-0000-000000000001',2,'09:00','18:00',8);

INSERT INTO bookings
(id,user_id,pet_id,provider_id,service_id,scheduled_at,status,total_amount,platform_commission,notes) VALUES
('50000000-0000-0000-0000-000000000001',
'00000000-0000-0000-0000-000000000001',
'20000000-0000-0000-0000-000000000001',
'30000000-0000-0000-0000-000000000001',
'40000000-0000-0000-0000-000000000001',
'2026-06-15 11:00:00-06','completada',550,82.50,'Primera consulta del piloto.');

INSERT INTO payments
(id,booking_id,payment_provider,external_reference,amount,commission_amount,status,paid_at) VALUES
('60000000-0000-0000-0000-000000000001',
'50000000-0000-0000-0000-000000000001',
'simulado','PAY-CALLI-0001',550,82.50,'pagado','2026-06-15 10:55:00-06');

INSERT INTO reviews
(id,booking_id,user_id,provider_id,rating,comment) VALUES
('70000000-0000-0000-0000-000000000001',
'50000000-0000-0000-0000-000000000001',
'00000000-0000-0000-0000-000000000001',
'30000000-0000-0000-0000-000000000001',
5,'Atención clara y puntual.');

INSERT INTO pet_health_records
(id,pet_id,provider_id,record_type,title,description,occurred_on,next_due_on) VALUES
('80000000-0000-0000-0000-000000000001',
'20000000-0000-0000-0000-000000000001',
'30000000-0000-0000-0000-000000000001',
'consulta','Consulta general','La mascota se encontró estable.','2026-06-15','2026-12-15');

COMMIT;
