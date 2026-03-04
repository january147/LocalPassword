use std::process::Command;
use std::env;

#[tauri::command]
pub async fn list_passwords(master_password: Option<String>) -> Result<String, String> {
    let mut cmd = Command::new("pm");
    cmd.arg("--non-interactive")
       .arg("--log-level")
       .arg("off")
       .arg("list");

    // 设置主密码环境变量
    if let Some(pwd) = master_password {
        cmd.env("PM_MASTER_PASSWORD", pwd);
    }

    cmd.output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_password(
    master_password: Option<String>,
    title: String,
    username: String,
    password: String,
    website: Option<String>,
    notes: Option<String>,
    category: Option<String>
) -> Result<String, String> {
    let mut cmd = Command::new("pm");
    cmd.arg("--non-interactive")
       .arg("--log-level")
       .arg("off")
       .arg("add");

    // 设置主密码环境变量
    if let Some(pwd) = master_password {
        cmd.env("PM_MASTER_PASSWORD", pwd);
    }

    cmd.arg(&title)
       .arg(&username)
       .arg(&password);

    if let Some(website) = website {
        cmd.arg("--website");
        cmd.arg(&website);
    }

    if let Some(notes) = notes {
        cmd.arg("--notes");
        cmd.arg(&notes);
    }

    if let Some(category) = category {
        cmd.arg("--category");
        cmd.arg(&category);
    }

    cmd.output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_password(
    master_password: Option<String>,
    id: String,
    title: String,
    username: String,
    password: String,
    website: Option<String>,
    notes: Option<String>,
    category: Option<String>
) -> Result<String, String> {
    let mut cmd = Command::new("pm");
    cmd.arg("--non-interactive")
       .arg("--log-level")
       .arg("off")
       .arg("update");

    // 设置主密码环境变量
    if let Some(pwd) = master_password {
        cmd.env("PM_MASTER_PASSWORD", pwd);
    }

    cmd.arg(&id)
       .arg(&title)
       .arg(&username)
       .arg(&password);

    if let Some(website) = website {
        cmd.arg("--website");
        cmd.arg(&website);
    }

    if let Some(notes) = notes {
        cmd.arg("--notes");
        cmd.arg(&notes);
    }

    if let Some(category) = category {
        cmd.arg("--category");
        cmd.arg(&category);
    }

    cmd.output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_password(master_password: Option<String>, id: String) -> Result<String, String> {
    let mut cmd = Command::new("pm");
    cmd.arg("--non-interactive")
       .arg("--log-level")
       .arg("off")
       .arg("delete")
       .arg(&id)
       .arg("--force");

    // 设置主密码环境变量
    if let Some(pwd) = master_password {
        cmd.env("PM_MASTER_PASSWORD", pwd);
    }

    cmd.output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn generate_password(
    length: usize,
    uppercase: bool,
    lowercase: bool,
    numbers: bool,
    symbols: bool
) -> Result<String, String> {
    let mut cmd = Command::new("pm");
    cmd.arg("generate")
       .arg("--length")
       .arg(length.to_string());

    if uppercase {
        cmd.arg("--uppercase");
    }
    if lowercase {
        cmd.arg("--lowercase");
    }
    if numbers {
        cmd.arg("--numbers");
    }
    if symbols {
        cmd.arg("--symbols");
    }

    cmd.output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn export_passwords(master_password: Option<String>, path: String) -> Result<String, String> {
    let mut cmd = Command::new("pm");
    cmd.arg("--non-interactive")
       .arg("--log-level")
       .arg("off")
       .arg("export")
       .arg(&path);

    // 设置主密码环境变量
    if let Some(pwd) = master_password {
        cmd.env("PM_MASTER_PASSWORD", pwd);
    }

    cmd.output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn import_passwords(master_password: Option<String>, path: String) -> Result<String, String> {
    let mut cmd = Command::new("pm");
    cmd.arg("--non-interactive")
       .arg("--log-level")
       .arg("off")
       .arg("import")
       .arg(&path);

    // 设置主密码环境变量
    if let Some(pwd) = master_password {
        cmd.env("PM_MASTER_PASSWORD", pwd);
    }

    cmd.output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn init_database() -> Result<String, String> {
    Command::new("pm")
        .arg("init")
        .arg("--force")
        .output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn cleanup_database() -> Result<String, String> {
    Command::new("pm")
        .arg("cleanup")
        .output()
        .map(|output| String::from_utf8_lossy(&output.stdout).to_string())
        .map_err(|e| e.to_string())
}
