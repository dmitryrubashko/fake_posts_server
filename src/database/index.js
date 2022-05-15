import cls from 'cls-hooked';
import { Sequelize } from 'sequelize';
import { registerModels } from '../../models';

export default class Database {
  constructor(environment, dbConfig) {
    this.environment = environment;
    this.dbConfig = dbConfig;
    this.isTestEnvironment = this.environment === 'test';
  }

  async connect() {
    // Настройка пространства имен для транзакций
    const namespace = cls.createNamespace('transactions-namespace');
    Sequelize.useCLS(namespace);

    // создание соединения
    const { username, password, host, port, database, dialect } =
      this.dbConfig[this.environment];
    this.connection = new Sequelize({
      username,
      password,
      host,
      port,
      database,
      dialect,
      logging: this.isTestEnvironment ? false : console.log,
    });

    // чекаем, успешно ли мы законнектились
    await this.connection.authenticate({ logging: false });

    if (!this.isTestEnvironment) {
      console.log(
        'Connection to the database has been established successfully!'
      );
    }
    // регистрация модели
    registerModels(this.connection);
    // синхронизация модели
    await this.sync();
  }
  async disconnect() {
    await this.connection.close();
  }
  async sync() {
    await this.connection.sync({
      logging: false,
      force: this.isTestEnvironment,
    });

    if (!this.isTestEnvironment) {
      console.log('Connection synced successfully!');
    }
  }
}