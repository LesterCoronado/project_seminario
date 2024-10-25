import { Subject, Observable } from 'rxjs';

// Definimos la clase NotificationService
class NotificationService {
  // Declaramos el tipo de subject como Subject<boolean>
  private subject: Subject<boolean>;
  private AsignacionRecurso: Subject<boolean>;
  private Actividad: Subject<boolean>;
  private Prueba: Subject<boolean>;
  private Error: Subject<boolean>;
  private Equipo: Subject<boolean>;
  private Login: Subject<boolean>;

  constructor() {
    // Inicializamos el subject
    this.subject = new Subject<boolean>();
    this.AsignacionRecurso = new Subject<boolean>();
    this.Actividad = new Subject<boolean>();
    this.Prueba = new Subject<boolean>();
    this.Error = new Subject<boolean>();
    this.Equipo = new Subject<boolean>();
    this.Login = new Subject<boolean>();
  }

  // Método para enviar notificaciones, recibe un booleano
  sendNotification(value: boolean): void {
    this.subject.next(value);
  }

  // Método para obtener el observable que los componentes se suscribirán
  getNotification(): Observable<boolean> {
    return this.subject.asObservable();
  }

  // Notificar Recurso
  sendAsignacionRecurso(value: boolean): void {
    this.AsignacionRecurso.next(value);
  }
  getAsignacionRecurso(): Observable<boolean> {
    return this.AsignacionRecurso.asObservable();
  }
  // Notificar Actividad
  sendActividad(value: boolean): void {
    this.Actividad.next(value);
  }
  getActividad(): Observable<boolean> {
    return this.Actividad.asObservable();
  }
  // Notificar Prueba
  sendPrueba(value: boolean): void {
    this.Prueba.next(value);
  }
  getPrueba(): Observable<boolean> {
    return this.Prueba.asObservable();
  }
   // Notificar Error
   sendError(value: boolean): void {
    this.Error.next(value);
  }
  getError(): Observable<boolean> {
    return this.Error.asObservable();
  }
   // Notificar Equipo
   sendEquipo(value: boolean): void {
    this.Equipo.next(value);
  }
  getEquipo(): Observable<boolean> {
    return this.Equipo.asObservable();
  }
   // Notificar Nuevo Login
   sendLogin(value: boolean): void {
    this.Login.next(value);
  }
  getLogin(): Observable<boolean> {
    return this.Login.asObservable();
  }
}

// Exportamos una instancia del servicio
export const notificationService = new NotificationService();
