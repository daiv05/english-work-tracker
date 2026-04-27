# Design Document — English Work Tracker (PWA)

## 1. Overview

**Nombre:** English Work Tracker
**Tipo:** Progressive Web App (PWA)
**Stack:** React + IndexedDB (offline-first) + backend opcional (Supabase o API propia)
**Distribución:** Empaquetado como PWA y publicación en Microsoft Store

Aplicación enfocada en hacer tracking estructurado del plan de estudio de inglés orientado al entorno laboral, con énfasis en:

- Consistencia diaria
- Producción activa (writing + speaking)
- Registro flexible por bloques durante el día
- Centralización de recursos personalizados
- Métricas reales de progreso

---

# 2. Objetivos del Producto

## 2.1 Objetivo Principal

Permitir mantener una rutina sostenible de estudio laboral (1–2h diarias) sin fricción y con medición clara del progreso.

## 2.2 Objetivos Secundarios

- No asumir que el estudio ocurre en un solo bloque.
- Permitir registrar múltiples sesiones en distintos momentos del día.
- Centralizar enlaces de estudio por categoría.
- Forzar producción escrita frecuente.
- Visualizar progreso mensual y acumulado.

---

# 3. Principios de Diseño

1. **Flexible, no rígido:** El usuario puede estudiar en 2–4 bloques pequeños.
2. **Output obligatorio:** Siempre habrá espacio para producir (escribir o hablar).
3. **Registro simple:** Añadir actividad debe tomar <10 segundos.
4. **Offline first:** Debe funcionar sin internet.
5. **Medición acumulativa:** El progreso se mide por consistencia, no por intensidad aislada.

---

# 4. Arquitectura

## 4.1 Frontend

- React (Vite)
- React Router
- Zustand o Context API
- IndexedDB (Dexie recomendado)
- Service Worker
- Web App Manifest

## 4.2 Backend (Opcional V2)

- Supabase o API REST
- Sincronización opcional
- Backup en la nube

---

# 5. Estructura de Módulos

## 5.1 Dashboard

Muestra:

- Tiempo acumulado hoy
- Número de bloques registrados hoy
- Racha actual
- Progreso semanal (% meta alcanzada)
- Botón: “Registrar actividad”
- Botón: “Modo escritura”

---

## 5.2 Registro Diario Flexible (Core Feature)

### Concepto Clave

Un día no es una sola sesión.
Un día contiene múltiples **bloques de actividad**.

Ejemplo real:

- 7:30am → 20 min podcast
- 12:30pm → 15 min lectura
- 8:00pm → 30 min writing

Todos pertenecen al mismo día.

---

## 5.3 Modelo de Registro por Bloque

Cada bloque contiene:

- Fecha
- Hora inicio (opcional)
- Tipo de actividad
- Recurso utilizado (seleccionado o personalizado)
- Descripción libre (qué hiciste exactamente)
- Tiempo en minutos

Tipos de actividad:

- Listening
- Reading
- Writing
- Speaking
- Shadowing
- Vocabulary (Anki)
- Other

---

# 6. Sistema de Contenido Recomendado (Actualizado)

## 6.1 Objetivo

Centralizar todos los enlaces útiles por categoría para tenerlos “a la mano” al momento de registrar actividad.

---

## 6.2 Categorías Configurables

El usuario puede crear y gestionar categorías como:

- Series laborales
- Podcasts
- YouTube técnico
- Artículos
- Documentación técnica
- Reuniones reales
- Emails reales
- Recursos personalizados

---

## 6.3 Enlaces por Categoría

Cada categoría permite:

- Agregar múltiples enlaces
- Título personalizado
- URL
- Notas opcionales
- Etiquetas (ej: technical, casual, advanced)

Ejemplo estructura:

```json
{
  id,
  category_id,
  title,
  url,
  notes,
  tags[]
}
```

---

## 6.4 Uso en Registro Diario

Al registrar una actividad:

1. Selecciona tipo (Listening, Reading, etc.)
2. Puede:
   - Elegir un recurso existente (dropdown filtrado por categoría)
   - O escribir manualmente qué utilizó

3. Indica duración
4. Agrega nota breve (ej: “Shadowing 5 min del minuto 03:00 al 08:00”)

Esto permite trazabilidad real de progreso.

---

# 7. Daily Writing Mode (Feature Principal)

## 7.1 Objetivo

Forzar producción escrita frecuente orientada al entorno profesional.

---

## 7.2 Características

- Editor minimalista
- Guardado automático
- Contador de palabras
- Tiempo activo de escritura
- Historial por fecha
- Posibilidad de múltiples escritos en un mismo día

---

## 7.3 Prompts Sugeridos

Generados automáticamente o seleccionables:

- Escribe un email explicando un bug.
- Resume tu día laboral.
- Explica un feature técnico.
- Simula una reunión.
- Describe una mejora en un sistema.

También puede escribir sin prompt.

---

## 7.4 Métricas de Escritura

- Total palabras acumuladas
- Palabras por mes
- Días consecutivos escribiendo
- Promedio palabras por sesión
- Total minutos escribiendo

---

# 8. Métricas Globales

## 8.1 Diarias

- Minutos totales
- Bloques registrados
- Tipos de actividad realizados

## 8.2 Semanales

- Total minutos
- % meta alcanzada
- Actividad más frecuente
- Writing consistency

## 8.3 Mensuales

- Total horas
- Total palabras escritas
- Autoevaluación estructurada
- Gráfico tipo heatmap

---

# 9. Sistema de Rachas

Reglas:

- Día válido = ≥30 minutos acumulados
- Día completo = ≥60 minutos
- La racha depende de días válidos consecutivos

La racha no depende de hacer todo en una sola sesión.

---

# 10. UX Flow Diario

### Escenario A — Registro rápido

1. Abrir app
2. Click “Registrar actividad”
3. Seleccionar tipo
4. Seleccionar recurso o escribir uno nuevo
5. Ingresar minutos
6. Guardar

Duración del flujo: <10 segundos.

---

### Escenario B — Modo escritura

1. Click “Modo escritura”
2. Seleccionar prompt o libre
3. Escribir
4. Guardado automático
5. Se registra automáticamente como bloque Writing

---

### Escenario C — Vista del Día

Muestra:

- Lista cronológica de bloques
- Total acumulado
- Posibilidad de editar/eliminar bloque
- Resumen visual por tipo

---

# 11. Modelo de Datos Final

## users

- id
- created_at

## daily_blocks

- id
- date
- start_time (nullable)
- type
- resource_id (nullable)
- custom_resource_text (nullable)
- duration_minutes
- notes

## writing_entries

- id
- date
- text
- word_count
- active_time_minutes
- linked_block_id (nullable)

## resource_categories

- id
- name

## resources

- id
- category_id
- title
- url
- notes
- tags_json

## monthly_reviews

- month
- answers_json
- notes

---

# 12. Offline Strategy

- IndexedDB como fuente primaria
- Sincronización diferida opcional
- Service worker cache-first
- Exportación manual JSON como backup

---

# 13. Roadmap

## MVP

- Dashboard
- Registro por bloques
- Categorías + enlaces personalizados
- Writing mode básico
- Racha
- Offline completo

## V2

- Estadísticas avanzadas
- Exportar CSV
- Sincronización en la nube
- Feedback automático en escritura

## V3

- Análisis de evolución lingüística
- Recomendación inteligente de enfoque
- Métricas predictivas

---

# 14. Publicación como PWA

Pasos:

1. Manifest.json completo
2. Service worker estable
3. Soporte offline real
4. Empaquetar con PWABuilder
5. Publicar en Microsoft Store

Requisitos:

- Iconos adaptativos
- Política de privacidad
- Versionado semántico
- Testing en Windows

---

# 15. Diferenciador

No es una app genérica de inglés.

Es:

- Orientada a uso profesional real
- Flexible por bloques diarios
- Con centralización de recursos
- Con escritura estructurada
- Medible y acumulativa
- Diseñada para consistencia a largo plazo

---
