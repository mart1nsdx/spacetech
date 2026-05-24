# Rocket Simulation — Lagrangian Dynamics / First Person

Simulación de lanzamiento de cohetes en vista primera persona (estilo Halo).  
Física derivada del formalismo Lagrangiano, integrada con Runge-Kutta de orden 4.

## Build & Run

```bash
cmake -B build && cmake --build build
./build/rocket_sim
```

Requiere macOS con OpenGL + GLUT (incluidos por defecto).

---

## Controles

| Tecla | Acción |
|---|---|
| `SPACE` | Lanzar cohete |
| `R` | Reset — volver a configurar |
| `ESC` | Salir |
| `1` – `7` | Seleccionar parámetro del panel |
| `+` / `-` | Aumentar / disminuir valor del parámetro seleccionado |
| `W A S D` | Mover cámara |
| Flechas | Rotar vista |
| Click + drag | Rotar vista con mouse |
| `T` | Toggle: auto-seguir el cohete con la cámara |

---

## Física Lagrangiana

### Coordenadas generalizadas

```
q = (x, y, z)   posición en 3D
q̇ = (ẋ, ẏ, ż)   velocidad
```

### Lagrangiano

```
L = T − V

T = ½ m(t) (ẋ² + ẏ² + ż²)     energía cinética
V = m(t) · g · y               energía potencial (gravedad)
```

### Ecuaciones de Euler-Lagrange

Con fuerzas generalizadas no-conservativas `Qi` (empuje + arrastre):

```
d/dt (∂L/∂q̇i) − ∂L/∂qi = Qi

→  m·ẍ = Fx_thrust + Fx_drag
→  m·ÿ = −mg + Fy_thrust + Fy_drag
→  m·z̈ = Fz_thrust + Fz_drag
   ṁ    = −flujo de combustible   (durante la fase de quema)
```

### Fuerzas modeladas

| Fuerza | Modelo |
|---|---|
| Gravedad | `Fg = (0, −mg, 0)` |
| Empuje (thrust) | `Ft = F · d̂(θ, φ)` durante `t < burn_time` |
| Arrastre aerodinámico | `Fd = −½ ρ Cd A |v|² v̂` |
| Pérdida de masa | `ṁ = −m_fuel / burn_time` |

### Integrador

**Runge-Kutta 4** con 4 subpasos por frame (≈ 240 Hz efectivo):

```
k1 = f(t,   y)
k2 = f(t+h/2, y + h/2·k1)
k3 = f(t+h/2, y + h/2·k2)
k4 = f(t+h,   y + h·k3)

y_{n+1} = y_n + (h/6)(k1 + 2k2 + 2k3 + k4)
```

---

## Parámetros editables (condiciones iniciales)

| # | Parámetro | Default | Rango |
|---|---|---|---|
| 1 | Elevation | 80 ° | 5 – 89 |
| 2 | Azimuth | 0 ° | 0 – 359 |
| 3 | Thrust | 3000 N | 100 – 50 000 |
| 4 | Burn time | 8 s | 1 – 120 |
| 5 | Total mass | 80 kg | 10 – 5000 |
| 6 | Fuel mass | 30 kg | 1 – 4990 |
| 7 | Drag Cd | 0.4 | 0.05 – 2.0 |

El cohete con defaults sube ~1–2 km y traza una curva visible desde el suelo.

---

## Estructura del proyecto

```
rockets/
├── CMakeLists.txt   build system
├── physics.h        structs Vec3, RocketState, LaunchParams + declaraciones
├── physics.cpp      Euler-Lagrange + integrador RK4
└── main.cpp         ventana GLUT, cámara FPS, renderizado 3D, HUD
```

---

## Próximos pasos posibles

- Agregar variación de densidad del aire con altitud (atmósfera estándar ISA)
- Etapas múltiples (separación de cohetes)
- Visualizar la curva de energía `T`, `V`, `H = T + V` en el HUD
- Exportar trayectoria a CSV para análisis externo
- Reemplazar GLUT por GLFW + Dear ImGui para UI más rica
