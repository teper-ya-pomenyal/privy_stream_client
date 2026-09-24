// Без консольного окна в релизной сборке на Windows.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    privy_stream_lib::run()
}
