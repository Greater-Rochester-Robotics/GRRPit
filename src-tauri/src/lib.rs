use tauri::{WebviewUrl, WebviewWindow, WebviewWindowBuilder};

#[tauri::command]
fn get_macos_titlebar(webview_window: WebviewWindow) -> f64 {
    #[cfg(target_os = "macos")]
    {
        use objc2_app_kit::NSWindow;
        use objc2_foundation::NSRect;

        let ns_window = webview_window.ns_window().unwrap() as *mut Object;;

        let frame = ns_window.frame();
        let content = ns_window.contentRectForFrameRect(frame);

        (frame.size.height - content.size.height).into();
    }

    (-1).into()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .invoke_handler(tauri::generate_handler![get_macos_titlebar])
        .setup(|app| {
            let win_builder =
                WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                    .title("GRRPit")
                    .transparent(true)
                    .maximized(true);

            #[cfg(target_os = "macos")]
            {
                use tauri::TitleBarStyle;
                use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

                let window = win_builder.title_bar_style(TitleBarStyle::Overlay).build().unwrap();
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

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
