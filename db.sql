create database bancosolar;

\c bancosolar

create table usuarios (
id serial primary key,
nombre varchar(50) not null,
balance float check (balance >= 0) not null);

create table transferencias (
id serial primary key,
emisor int not null,
receptor int not null,
monto float not null,
fecha timestamp not null,
foreign key (emisor) references usuarios(id),
foreign key (receptor) references usuarios(id));
