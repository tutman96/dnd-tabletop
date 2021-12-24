
# dtoverlay=vc4-kms-v3d
## `chromium-browser --ignore-gpu-blacklist --disable-gpu-rasterization --disable-oop-rasterization --disable-bundled-ppapi-flash --kiosk --start-fullscreen --show-fps-counter --enable-logging=stderr '--vmodule=head*=1' https://tutman96.github.io/dnd-tabletop/#/table`
2.1 fps 14.1% cpu 213M free memory

## `chromium-browser --ignore-gpu-blacklist --enable-gpu-rasterization --enable-zero-copy --enable-native-gpu-memory-buffers --kiosk --start-fullscreen --show-fps-counter --enable-logging=stderr '--vmodule=head*=1' https://tutman96.github.io/dnd-tabletop/#/table`
2.1 fps 13.5% cpu 212M free memory

## `chromium-browser --ignore-gpu-blacklist --enable-gpu-rasterization --enable-zero-copy --enable-native-gpu-memory-buffers --disable-gpu-sandbox --kiosk --start-fullscreen --show-fps-counter --enable-logging=stderr '--vmodule=head*=1' https://tutman96.github.io/dnd-tabletop/#/table`
2.7 fps 18.2% cpu 212M free memory

## `chromium-browser --ignore-gpu-blacklist --enable-gpu-rasterization --enable-zero-copy --enable-native-gpu-memory-buffers --disable-gpu-vsync --kiosk --start-fullscreen --show-fps-counter --enable-logging=stderr '--vmodule=head*=1' https://tutman96.github.io/dnd-tabletop/#/table`
2.4 fps 18.2% cpu 212M free memory



# dtoverlay=vc4-fkms-v3d
## `chromium-browser --ignore-gpu-blacklist --enable-gpu-rasterization --enable-zero-copy --enable-native-gpu-memory-buffers --kiosk --start-fullscreen --show-fps-counter --enable-logging=stderr '--vmodule=head*=1' https://tutman96.github.io/dnd-tabletop/#/table`
0.2 fps 14.5% cpu 203M free memory


## `chromium-browser --ignore-gpu-blacklist --enable-gpu-rasterization --enable-zero-copy --enable-native-gpu-memory-buffers --enable-hardware-overlays --use-gl=desktop --enable-features=VaapiVideoDecoder --force-overlay-fullscreen-video --kiosk --start-fullscreen --disable-pinch --show-fps-counter --enable-logging=stderr '--vmodule=head*=1' https://tutman96.github.io/dnd-tabletop/#/table`