#!/bin/bash
set -e

get_architecture() {
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64) echo "amd64" ;;
    aarch64|arm64) echo "arm64" ;;
    *) echo "amd64" ;;
  esac
}

build_download_url() {
  local ARCH
  ARCH=$(get_architecture)
  echo "https://github.com/bqlpfy/flux-panel/releases/download/1.4.3/gost-${ARCH}"
}

DOWNLOAD_URL=$(build_download_url)
INSTALL_DIR="/etc/gost"
SERVICE_FILE="/etc/systemd/system/gost.service"

COUNTRY=$(curl -s https://ipinfo.io/country || true)
if [ "$COUNTRY" = "CN" ]; then
  DOWNLOAD_URL="https://ghfast.top/${DOWNLOAD_URL}"
fi

show_menu() {
  echo "==============================================="
  echo "          须尽欢节点管理脚本"
  echo "==============================================="
  echo "1. 安装"
  echo "2. 更新"
  echo "3. 卸载"
  echo "4. 退出"
  echo "==============================================="
}

delete_self() {
  SCRIPT_PATH="$(readlink -f "$0" 2>/dev/null || realpath "$0" 2>/dev/null || echo "$0")"
  rm -f "$SCRIPT_PATH" 2>/dev/null || true
}

get_config_params() {
  if [[ -z "$SERVER_ADDR" ]]; then
    read -p "服务器地址: " SERVER_ADDR
  fi
  if [[ -z "$SECRET" ]]; then
    read -p "密钥: " SECRET
  fi
  if [[ -z "$SERVER_ADDR" || -z "$SECRET" ]]; then
    echo "参数不完整，操作取消。"
    exit 1
  fi
}

while getopts "a:s:" opt; do
  case "$opt" in
    a) SERVER_ADDR="$OPTARG" ;;
    s) SECRET="$OPTARG" ;;
    *) echo "无效参数"; exit 1 ;;
  esac
done

install_node() {
  echo "开始安装须尽欢节点..."
  get_config_params
  mkdir -p "$INSTALL_DIR"

  if systemctl list-units --full -all | grep -Fq "gost.service"; then
    systemctl stop gost 2>/dev/null || true
    systemctl disable gost 2>/dev/null || true
  fi

  curl -L "$DOWNLOAD_URL" -o "$INSTALL_DIR/gost"
  if [[ ! -s "$INSTALL_DIR/gost" ]]; then
    echo "下载失败，请检查网络或下载链接。"
    exit 1
  fi
  chmod +x "$INSTALL_DIR/gost"

  cat > "$INSTALL_DIR/config.json" <<EOF
{
  "addr": "$SERVER_ADDR",
  "secret": "$SECRET"
}
EOF

  if [[ ! -f "$INSTALL_DIR/gost.json" ]]; then
    echo "{}" > "$INSTALL_DIR/gost.json"
  fi
  chmod 600 "$INSTALL_DIR"/*.json

  cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=Xu Jin Huan Node Service
After=network.target

[Service]
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/gost
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable gost
  systemctl restart gost

  if systemctl is-active --quiet gost; then
    echo "安装完成，节点服务已启动。"
  else
    echo "节点服务启动失败，请执行 journalctl -u gost -f 查看日志。"
    exit 1
  fi
}

update_node() {
  echo "开始更新须尽欢节点..."
  if [[ ! -d "$INSTALL_DIR" ]]; then
    echo "节点未安装，请先安装。"
    return 1
  fi
  curl -L "$DOWNLOAD_URL" -o "$INSTALL_DIR/gost.new"
  if [[ ! -s "$INSTALL_DIR/gost.new" ]]; then
    echo "下载失败。"
    return 1
  fi
  systemctl stop gost 2>/dev/null || true
  mv "$INSTALL_DIR/gost.new" "$INSTALL_DIR/gost"
  chmod +x "$INSTALL_DIR/gost"
  systemctl restart gost
  echo "更新完成。"
}

uninstall_node() {
  read -p "确认卸载须尽欢节点吗？此操作将删除所有相关文件 (y/N): " confirm
  if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "取消卸载"
    return 0
  fi
  systemctl stop gost 2>/dev/null || true
  systemctl disable gost 2>/dev/null || true
  rm -f "$SERVICE_FILE"
  rm -rf "$INSTALL_DIR"
  systemctl daemon-reload
  echo "卸载完成。"
}

main() {
  if [[ -n "$SERVER_ADDR" && -n "$SECRET" ]]; then
    install_node
    delete_self
    exit 0
  fi

  while true; do
    show_menu
    read -p "请输入选项 (1-4): " choice
    case "$choice" in
      1) install_node; delete_self; exit 0 ;;
      2) update_node; delete_self; exit 0 ;;
      3) uninstall_node; delete_self; exit 0 ;;
      4) echo "退出脚本"; delete_self; exit 0 ;;
      *) echo "无效选项，请输入 1-4" ;;
    esac
  done
}

main
