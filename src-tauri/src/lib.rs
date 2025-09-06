use tauri::{WebviewUrl, WebviewWindowBuilder};

#[cfg(target_os = "macos")]
use {
    tauri::TitleBarStyle,
    window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial}
};

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
            let win_builder = win_builder.title_bar_style(TitleBarStyle::Overlay);

            let window = win_builder.build().unwrap();

            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            #[cfg(target_os = "windows")]
            {
                use window_vibrancy::apply_mica;
                apply_mica(&window, Some(true))
                    .expect("Unsupported platform! 'apply_mica' is only supported on Windows");
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
