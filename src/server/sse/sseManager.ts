import { Response } from 'express';

interface SSEClient {
  res: Response;
  id: string;
}

class SSEManager {
  // Mapa de matchId a Set de clientes conectados exclusivamente a ese partido
  private matchClients = new Map<number, Set<SSEClient>>();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startHeartbeat();
  }

  /**
   * Registra un cliente SSE para un partido específico
   */
  public addClient(matchId: number, res: Response, clientId: string = Math.random().toString(36).substring(7)) {
    if (!this.matchClients.has(matchId)) {
      this.matchClients.set(matchId, new Set());
    }

    const client: SSEClient = { res, id: clientId };
    this.matchClients.get(matchId)!.add(client);

    // Enviar evento de conexión exitosa
    this.sendToClient(res, 'connected', {
      matchId,
      clientId,
      timestamp: new Date().toISOString(),
      message: `Conectado exitosamente al stream del partido ${matchId}`
    });

    console.log(`[SSE] Cliente ${clientId} conectado al partido ${matchId}. Total en partido: ${this.matchClients.get(matchId)!.size}`);

    // Limpieza al cerrar la conexión
    res.on('close', () => {
      this.removeClient(matchId, client);
    });

    return client;
  }

  /**
   * Remueve un cliente desconectado
   */
  public removeClient(matchId: number, client: SSEClient) {
    const clients = this.matchClients.get(matchId);
    if (clients) {
      clients.delete(client);
      console.log(`[SSE] Cliente ${client.id} desconectado del partido ${matchId}. Restantes: ${clients.size}`);
      if (clients.size === 0) {
        this.matchClients.delete(matchId);
      }
    }
  }

  /**
   * Transmite un evento ÚNICAMENTE a los clientes del partido especificado
   * Garantiza el aislamiento de eventos entre partidos (Requisito 3 y 5)
   */
  public broadcastToMatch(matchId: number, eventName: string, data: any) {
    const clients = this.matchClients.get(matchId);
    if (!clients || clients.size === 0) {
      console.log(`[SSE] No hay clientes escuchando en el partido ${matchId}`);
      return;
    }

    console.log(`[SSE] Transmitiendo evento '${eventName}' a ${clients.size} cliente(s) en partido ${matchId}`);
    clients.forEach(({ res, id }) => {
      try {
        this.sendToClient(res, eventName, data);
      } catch (error) {
        console.error(`[SSE] Error enviando a cliente ${id}:`, error);
      }
    });
  }

  /**
   * Formatea y envía un mensaje compatible con el estándar text/event-stream
   */
  private sendToClient(res: Response, eventName: string, data: any) {
    res.write(`event: ${eventName}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  /**
   * Mantiene las conexiones activas mediante un ping cada 25 segundos
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.matchClients.forEach((clients, matchId) => {
        clients.forEach(({ res }) => {
          try {
            res.write(`: ping ${new Date().toISOString()}\n\n`);
          } catch {
            // Ignorar errores de ping
          }
        });
      });
    }, 25000);
  }

  /**
   * Cantidad de clientes conectados a un partido
   */
  public getClientCount(matchId: number): number {
    return this.matchClients.get(matchId)?.size || 0;
  }
}

export const sseManager = new SSEManager();
