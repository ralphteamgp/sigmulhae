# PlantFit Ralphthon Visual Direction

Date: 2026-03-29
Source PRD: `PlantFit_PRD_v2.1.md`
Status: approved direction

## Goal

Make PlantFit feel instantly memorable in a Ralphthon demo without changing the core product shape from the wireframe.

The product should not read as a generic plant app or a generic analytics dashboard. It should feel like sunlight is actively reading the user's home and revealing where plants can thrive.

## Approved Direction

Direction: `Data-Cinematic`

Core statement:

> PlantFit is a spatial sunlight interface where the home is scanned, illuminated, and activated in response to plant placement.

## What This Should Feel Like

- warm, luminous, and premium
- spatial and environmental
- precise enough for a product demo
- cinematic without becoming a VFX reel

## What This Should Not Feel Like

- generic SaaS dashboard
- flat CRUD app with plant branding
- cold sci-fi control room
- overly cute or toy-like character app
- heavy 3D demo that sacrifices reliability

## Three Hero Moments

### 1. Analysis Scan

Screen: `STEP 4`

Desired effect:
- floorplan or structural backdrop appears in low-contrast wireframe form
- a light sweep passes across the scene while analysis stages progress
- progress copy appears in crisp, technical language

Why it matters:
- this is the first moment where the app stops looking like a form flow and starts looking like a product with a point of view

### 2. Sunlight Reveal

Screen: `STEP 5`

Desired effect:
- light zones reveal progressively instead of appearing instantly
- the floorplan feels illuminated from a directional source
- small atmospheric particles or glow falloff reinforce the idea of sunlight moving through space

Why it matters:
- this is the clearest explanation of the product's intelligence in one glance

### 3. Placement Response

Screen: `STEP 7`

Desired effect:
- good placement visibly energizes the board
- bad placement visibly drains or rejects the placement zone
- user actions feel consequential before they read the helper text

Why it matters:
- this is the strongest interactive wow moment in the full experience

## Visual System

### Color

- sunlight gold: for strongest light zones and highlights
- leaf green: for good placement and healthy plant states
- moss/lime midtone: for viable but moderate zones
- cool shadow blue-gray: for weak-light areas
- deep charcoal-green background support: for contrast, not for dominant dark mode branding

### Surfaces

- floating glass-like cards with soft blur or translucent layering
- subtle depth through shadow and contrast rather than thick borders
- floorplan surface treated like a lit substrate, not a flat diagram

### Typography

- one expressive display face for hero numbers, key labels, or section moments
- one highly readable UI face for controls and supporting text
- avoid default-looking product typography stacks if possible

### Motion

- use directional sweeps, staggered reveals, fade-through transitions, and glow interpolation
- avoid springy motion that feels playful instead of premium
- every animation should explain system state or reward interaction

## Priority Order

If time runs short, preserve quality in this order:

1. `STEP 7` placement response
2. `STEP 5` sunlight reveal
3. `STEP 4` analysis scan
4. overall shell styling
5. secondary polish on care screens

## Technical Guidance

- Prefer 2D/2.5D illusion over full 3D scene complexity
- Use layered gradients, masks, particles, transforms, and SVG or canvas accents
- Keep effects performant on demo laptops and modern mobile browsers
- Allow a reduced-motion or simplified path if a surface becomes unstable

## Demo Readiness Standard

The app is visually ready when a first-time viewer can understand the following within seconds:

- the app reads light in a space
- the app turns that into a visible floorplan result
- the app reacts when a plant is placed in a good or bad area

If those three ideas are not obvious on sight, the design is not finished.
