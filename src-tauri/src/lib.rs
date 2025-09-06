#[allow(unused)]
use tauri::{WebviewUrl, WebviewWindow, WebviewWindowBuilder};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            let win_builder =
                WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                    .title("GRRPit")
                    .transparent(true)
                    .maximized(true);

            #[cfg(target_os = "macos")]
            {
                use tauri::window::{EffectsBuilder, Effect, Color};
                use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

                let window = win_builder
                    .effects(
                        EffectsBuilder::new()
                        .effects(vec![Effect::Sidebar])
                        .build()
                    )
                    .background_color(Color(0, 0, 0, 1))
                    .build()
                    .unwrap();

                apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                    .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");
            }

            #[cfg(target_os = "windows")]
            {
                use window_vibrancy::apply_mica;
                let window = win_builder.build().unwrap();
                apply_mica(&window, Some(true))
                    .expect("Unsupported platform! 'apply_mica' is only supported on Windows");
            }

            #[cfg(target_os = "linux")]
            win_builder.build();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
