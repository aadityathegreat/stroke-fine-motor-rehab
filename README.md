# stroke-fine-motor-rehab

Firmware and supporting code from a summer 2025 research project at UT Austin on measuring
fine motor control in the hand, using piano playing as the task.

## The project

Pressing a piano key asks the hand for something precise and repeatable, which makes it a
convenient way to observe fine motor control without inventing an artificial task. The device
built for this project places a force sensor under each of five keys and samples them with a
microcontroller while someone plays, so a keypress becomes a force trace over time rather than
a binary on/off event. The intended application is stroke rehabilitation, where the question
is whether hand control is measurably improving.

The work was done through the Freshman Research Initiative / High School Research Academy at
the University of Texas at Austin from June to July 2025, mentored by Patrick Benfield and
Rhiannon Morris. That program has ended and this repository is not under active development.

## What is here, and what is not

Here: the Arduino firmware that runs the sensing rig, and an unfinished React front end.

Not here: experimental data, analysis scripts, results, wiring diagrams, or a parts list. The
one-line description this repository previously carried ("code, data, and analysis tools")
described an intent rather than its contents. If you are looking for study results, they are
not in this repository.

## Layout

```
force_sensor/force_sensor.ino   The firmware. This is the substantive file.
force_sensor.ino                Empty file at the repository root, left over from setup.
website/                        Create React App front end, unfinished. src/App.js is the whole UI.
.vscode/tasks.json              A clang build task from the editor. Unrelated to the firmware.
README.md
```

## Firmware

`force_sensor/force_sensor.ino` reads five analog force sensors, converts each reading to a
percentage of a chosen full-scale force, and reports both a continuous stream for plotting and
discrete press/release events.

### How it works

**Pins.** Five sensors on `A0`–`A4`, five indicator LEDs on digital pins `2`–`6`. One LED per
sensor, lit while that sensor is in a pressed state. The sensor model, the interface circuit,
and the physical mount are not documented anywhere in this repository.

**Zero offset.** On first run each channel averages 200 analog samples to establish its
unloaded baseline, and stores the result in EEPROM (two bytes per channel starting at address
1) so the calibration survives a power cycle. A flag byte at address 0 records that this has
happened, and is written only after every channel has stored an offset, so a first boot
interrupted partway through recalibrates on the next run instead of loading garbage. Every
later reading subtracts that baseline and clamps at zero.

**Raw to force.** `rawToNewtons()` applies a fixed exponential fit,
`0.3202 * exp(0.0077 * raw) - 0.32`, and `forceToPercent()` divides by the full-scale value
selected at startup, clamped to 0–100%. The repository does not record how those coefficients
were derived or which sensor they were fit against, so treat them as specific to the original
build. Different sensors need a new fit.

**Smoothing.** An exponential moving average with asymmetric gain, `alphaRise = 0.1` on the way
up and `alphaFall = 0.5` on the way down, so the smoothed signal tracks a release faster than
it tracks a press.

**Press detection.** Hysteresis on the smoothed value. Crossing above `enterThresh` (default
2%) emits an `ENTER` line and lights the LED; falling below `exitThresh` (default 1%) emits an
`EXIT` line and clears it. The two thresholds are separate so a signal hovering near one value
does not chatter.

**Sampling rate.** The loop scans every 20 ms while any channel is above the exit threshold and
every 500 ms when everything is idle. A tab-separated line of all five instantaneous
percentages goes out every 100 ms regardless, which is what the Arduino Serial Plotter reads.

### Requirements

An AVR Arduino board with at least five analog inputs and EEPROM, plus the Arduino IDE (or
`arduino-cli`). The sketch includes only `EEPROM.h`, so there is nothing else to install. The
exact board used in the original build is not recorded here; the sketch compiles clean for
`arduino:avr:uno` and fits well inside an Uno, at roughly a third of program storage and just
under half of RAM.

```
arduino-cli compile --fqbn arduino:avr:uno force_sensor
```

### Running it

1. Open `force_sensor/force_sensor.ino` in the Arduino IDE. Note that the folder name matches
   the sketch name, which the IDE requires; open the folder, not the empty file at the
   repository root.
2. Select your board and port, then upload.
3. Open Serial Monitor at **9600 baud**. The sketch waits for the serial connection before
   doing anything, so nothing happens until the monitor is open.
4. It asks for a full-scale range. Send `1` for 5 N, `2` for 15 N, or `3` for 50 N. This is
   asked on every boot and is not persisted.
5. It prints the zero offset for each channel, then begins streaming.

For a live view of the force traces, close Serial Monitor and open Tools → Serial Plotter at
the same baud rate. The five tab-separated columns become five plotted channels.

### Serial commands

Sent at any time while running. Each is written to EEPROM and persists across reboots.

| Command  | Effect                              | Default |
| -------- | ----------------------------------- | ------- |
| `ET x`   | Press threshold, percent            | `2.0`   |
| `XT x`   | Release threshold, percent          | `1.0`   |
| `AR x`   | EMA gain on a rising signal         | `0.1`   |
| `AF x`   | EMA gain on a falling signal        | `0.5`   |

For example, `ET 3.5` raises the press threshold to 3.5%. The trailing space in the command
prefix matters; `ET3.5` is rejected as an unknown command.

### Recalibrating

Zero offsets are only recomputed when the byte at EEPROM address 0 is not `0xAA`, and stored
tuning values are only loaded when the byte at address 20 is `0x55`. To force a fresh
calibration or restore the default thresholds, clear those bytes with a separate sketch (the
stock `EEPROM_clear` example under File → Examples → EEPROM works) and then re-upload this one.
There is no command in this sketch that does it.

## Web app

`website/` is a Create React App project (React 19, `react-scripts`) whose entire UI lives in
`website/src/App.js`. It sketches a site for the project, with navigation, a contact form, and a
demo page.

It runs, but it is **not** connected to the device, and nothing it displays comes from real
hardware:

- The "connect to Arduino" handler is a placeholder. It waits two seconds and reports success;
  no serial connection is opened. The code carries a comment noting where
  `navigator.serial.requestPort()` would go.
- The demo plot is fed by `Math.random()`, not by the device.
- The contact form logs to the console and does not submit anywhere.

To run it:

```
cd website
npm install
npm start
```

`tailwindcss` is listed in devDependencies but no Tailwind config is committed, so the styling
comes from the plain CSS files. Treat this as a UI mockup, not a working interface to the rig.

## Known rough edges

Documented rather than fixed, since the project is complete.

- `sensorPins[]` is declared and never used; the `Sensor` objects are constructed with `A0`
  through `A4` directly.
- The file-scope `zeroOffset[]`, `smoothedPct[]`, and `inAlert[]` arrays are shadowed by the
  members of the same name inside `Sensor` and are dead.
- Nothing is logged to a file. Capturing a session means recording the serial output yourself.
- There are no tests, and no calibration procedure is documented against a known reference
  weight.
- `force_sensor.ino` at the repository root is an empty file and can be deleted.
