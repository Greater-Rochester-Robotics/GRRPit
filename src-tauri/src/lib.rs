use tauri::{WebviewUrl, WebviewWindow, WebviewWindowBuilder};

#[tauri::command]
fn get_macos_titlebar(webview_window: WebviewWindow) -> f64 {
    let mut px: f64 = 0.0;

    #[cfg(target_os = "macos")]
    {
        use cocoa::appkit::NSWindow;
        use cocoa::base::id;

        let ns_window = webview_window.ns_window().unwrap() as id;

        unsafe {
            let frame = ns_window.frame();
            let content = ns_window.contentRectForFrameRect_(frame);
            px = frame.size.height - content.size.height;
        }
    }

    px.into()
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

            #[cfg(target_os = "linux")]
            win_builder.build();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
