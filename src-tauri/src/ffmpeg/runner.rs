use std::process::Output;
use tokio::process::Command;

use crate::models::errors::AppError;

pub async fn run(program: &str, args: &[&str]) -> Result<Output, AppError> {
    let output = Command::new(program)
        .args(args)
        .output()
        .await
        .map_err(AppError::Io)?;
    Ok(output)
}

pub fn stderr_str(output: &Output) -> String {
    String::from_utf8_lossy(&output.stderr).to_string()
}

pub fn stdout_str(output: &Output) -> String {
    String::from_utf8_lossy(&output.stdout).to_string()
}
