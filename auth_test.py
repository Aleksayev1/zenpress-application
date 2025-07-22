#!/usr/bin/env python3
"""
Teste específico do sistema de autenticação do ZenPress
Foco: Testar apenas os endpoints de autenticação que estão causando problema no frontend
"""

import requests
import json
import time
from datetime import datetime

class ZenPressAuthTest:
    """Teste específico para sistema de autenticação do ZenPress"""
    
    # Base URL do backend
    BASE_URL = "https://429b38d5-6a73-460c-a938-66a7eb9ba46e.preview.emergentagent.com/api"
    
    # Dados de teste conforme solicitado
    test_user = {
        "name": "João Silva",
        "email": "joao@teste.com", 
        "password": "123456"
    }
    
    def __init__(self):
        self.access_token = None
        self.user_data = None
        self.test_results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log do resultado do teste"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASSOU" if success else "❌ FALHOU"
        print(f"\n{status} - {test_name}")
        print(f"   {message}")
        if details:
            print(f"   Detalhes: {details}")
    
    def test_01_register_user(self):
        """Teste 1: POST /api/auth/register - Criar novo usuário"""
        print("\n" + "="*60)
        print("TESTE 1: REGISTRO DE USUÁRIO")
        print("="*60)
        
        try:
            response = requests.post(
                f"{self.BASE_URL}/auth/register",
                json=self.test_user,
                timeout=10
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Data: {json.dumps(data, indent=2)}")
                
                # Verificar estrutura da resposta
                if "access_token" in data and "user" in data:
                    self.access_token = data["access_token"]
                    self.user_data = data["user"]
                    
                    # Verificar dados do usuário
                    user = data["user"]
                    if (user.get("name") == self.test_user["name"] and 
                        user.get("email") == self.test_user["email"] and
                        "id" in user):
                        
                        self.log_result(
                            "Registro de usuário",
                            True,
                            f"Usuário '{user['name']}' registrado com sucesso",
                            {
                                "user_id": user["id"],
                                "email": user["email"],
                                "token_length": len(data["access_token"])
                            }
                        )
                        return True
                    else:
                        self.log_result(
                            "Registro de usuário",
                            False,
                            "Dados do usuário na resposta não conferem",
                            {"expected": self.test_user, "received": user}
                        )
                else:
                    self.log_result(
                        "Registro de usuário",
                        False,
                        "Estrutura da resposta inválida - faltam 'access_token' ou 'user'",
                        {"response_keys": list(data.keys())}
                    )
            else:
                error_msg = response.text
                self.log_result(
                    "Registro de usuário",
                    False,
                    f"Falha no registro - Status {response.status_code}",
                    {"error": error_msg}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Registro de usuário",
                False,
                f"Erro de conexão: {str(e)}",
                {"exception_type": type(e).__name__}
            )
            
        return False
    
    def test_02_login_user(self):
        """Teste 2: POST /api/auth/login - Login de usuário existente"""
        print("\n" + "="*60)
        print("TESTE 2: LOGIN DE USUÁRIO")
        print("="*60)
        
        login_data = {
            "email": self.test_user["email"],
            "password": self.test_user["password"]
        }
        
        try:
            response = requests.post(
                f"{self.BASE_URL}/auth/login",
                json=login_data,
                timeout=10
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Data: {json.dumps(data, indent=2)}")
                
                # Verificar estrutura da resposta
                if "access_token" in data and "user" in data:
                    # Atualizar token (pode ser diferente do registro)
                    self.access_token = data["access_token"]
                    
                    # Verificar dados do usuário
                    user = data["user"]
                    if (user.get("email") == self.test_user["email"] and
                        "id" in user):
                        
                        self.log_result(
                            "Login de usuário",
                            True,
                            f"Login realizado com sucesso para '{user['email']}'",
                            {
                                "user_id": user["id"],
                                "token_length": len(data["access_token"]),
                                "token_different": data["access_token"] != self.access_token
                            }
                        )
                        return True
                    else:
                        self.log_result(
                            "Login de usuário",
                            False,
                            "Dados do usuário na resposta não conferem",
                            {"expected_email": self.test_user["email"], "received": user}
                        )
                else:
                    self.log_result(
                        "Login de usuário",
                        False,
                        "Estrutura da resposta inválida - faltam 'access_token' ou 'user'",
                        {"response_keys": list(data.keys())}
                    )
            else:
                error_msg = response.text
                self.log_result(
                    "Login de usuário",
                    False,
                    f"Falha no login - Status {response.status_code}",
                    {"error": error_msg}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Login de usuário",
                False,
                f"Erro de conexão: {str(e)}",
                {"exception_type": type(e).__name__}
            )
            
        return False
    
    def test_03_get_user_me(self):
        """Teste 3: GET /api/users/me - Obter dados do usuário logado"""
        print("\n" + "="*60)
        print("TESTE 3: OBTER DADOS DO USUÁRIO LOGADO")
        print("="*60)
        
        if not self.access_token:
            self.log_result(
                "Obter dados do usuário",
                False,
                "Token de acesso não disponível - testes anteriores falharam",
                None
            )
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            response = requests.get(
                f"{self.BASE_URL}/users/me",
                headers=headers,
                timeout=10
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Request Headers: {headers}")
            print(f"Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response Data: {json.dumps(data, indent=2)}")
                
                # Verificar dados do usuário
                if (data.get("email") == self.test_user["email"] and
                    data.get("name") == self.test_user["name"] and
                    "id" in data):
                    
                    self.log_result(
                        "Obter dados do usuário",
                        True,
                        f"Dados do usuário obtidos com sucesso",
                        {
                            "user_id": data["id"],
                            "name": data["name"],
                            "email": data["email"],
                            "is_premium": data.get("is_premium", False)
                        }
                    )
                    return True
                else:
                    self.log_result(
                        "Obter dados do usuário",
                        False,
                        "Dados do usuário não conferem com os esperados",
                        {
                            "expected": {"name": self.test_user["name"], "email": self.test_user["email"]},
                            "received": {"name": data.get("name"), "email": data.get("email")}
                        }
                    )
            else:
                error_msg = response.text
                self.log_result(
                    "Obter dados do usuário",
                    False,
                    f"Falha ao obter dados - Status {response.status_code}",
                    {"error": error_msg, "token_used": self.access_token[:20] + "..."}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Obter dados do usuário",
                False,
                f"Erro de conexão: {str(e)}",
                {"exception_type": type(e).__name__}
            )
            
        return False
    
    def test_04_register_duplicate_email(self):
        """Teste 4: Tentar registrar email duplicado"""
        print("\n" + "="*60)
        print("TESTE 4: REGISTRO COM EMAIL DUPLICADO")
        print("="*60)
        
        try:
            response = requests.post(
                f"{self.BASE_URL}/auth/register",
                json=self.test_user,  # Mesmo email do teste anterior
                timeout=10
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 400:
                data = response.json()
                print(f"Response Data: {json.dumps(data, indent=2)}")
                
                if "detail" in data and "already registered" in data["detail"].lower():
                    self.log_result(
                        "Registro email duplicado",
                        True,
                        "Sistema corretamente rejeitou email duplicado",
                        {"error_message": data["detail"]}
                    )
                    return True
                else:
                    self.log_result(
                        "Registro email duplicado",
                        False,
                        "Erro retornado mas mensagem não indica email duplicado",
                        {"response": data}
                    )
            else:
                self.log_result(
                    "Registro email duplicado",
                    False,
                    f"Status code inesperado - esperado 400, recebido {response.status_code}",
                    {"response": response.text}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Registro email duplicado",
                False,
                f"Erro de conexão: {str(e)}",
                {"exception_type": type(e).__name__}
            )
            
        return False
    
    def test_05_login_wrong_password(self):
        """Teste 5: Login com senha incorreta"""
        print("\n" + "="*60)
        print("TESTE 5: LOGIN COM SENHA INCORRETA")
        print("="*60)
        
        wrong_login_data = {
            "email": self.test_user["email"],
            "password": "senha_errada_123"
        }
        
        try:
            response = requests.post(
                f"{self.BASE_URL}/auth/login",
                json=wrong_login_data,
                timeout=10
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 401:
                data = response.json()
                print(f"Response Data: {json.dumps(data, indent=2)}")
                
                if "detail" in data:
                    self.log_result(
                        "Login senha incorreta",
                        True,
                        "Sistema corretamente rejeitou senha incorreta",
                        {"error_message": data["detail"]}
                    )
                    return True
                else:
                    self.log_result(
                        "Login senha incorreta",
                        False,
                        "Status 401 mas sem mensagem de erro adequada",
                        {"response": data}
                    )
            else:
                self.log_result(
                    "Login senha incorreta",
                    False,
                    f"Status code inesperado - esperado 401, recebido {response.status_code}",
                    {"response": response.text}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Login senha incorreta",
                False,
                f"Erro de conexão: {str(e)}",
                {"exception_type": type(e).__name__}
            )
            
        return False
    
    def test_06_access_without_token(self):
        """Teste 6: Tentar acessar /users/me sem token"""
        print("\n" + "="*60)
        print("TESTE 6: ACESSO SEM TOKEN DE AUTENTICAÇÃO")
        print("="*60)
        
        try:
            response = requests.get(
                f"{self.BASE_URL}/users/me",
                timeout=10
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 401:
                data = response.json()
                print(f"Response Data: {json.dumps(data, indent=2)}")
                
                self.log_result(
                    "Acesso sem token",
                    True,
                    "Sistema corretamente rejeitou acesso sem autenticação",
                    {"error_message": data.get("detail", "No detail provided")}
                )
                return True
            else:
                self.log_result(
                    "Acesso sem token",
                    False,
                    f"Status code inesperado - esperado 401, recebido {response.status_code}",
                    {"response": response.text}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Acesso sem token",
                False,
                f"Erro de conexão: {str(e)}",
                {"exception_type": type(e).__name__}
            )
            
        return False
    
    def test_07_access_with_invalid_token(self):
        """Teste 7: Tentar acessar /users/me com token inválido"""
        print("\n" + "="*60)
        print("TESTE 7: ACESSO COM TOKEN INVÁLIDO")
        print("="*60)
        
        try:
            headers = {"Authorization": "Bearer token_invalido_123456"}
            
            response = requests.get(
                f"{self.BASE_URL}/users/me",
                headers=headers,
                timeout=10
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Request Headers: {headers}")
            
            if response.status_code == 401:
                data = response.json()
                print(f"Response Data: {json.dumps(data, indent=2)}")
                
                self.log_result(
                    "Acesso com token inválido",
                    True,
                    "Sistema corretamente rejeitou token inválido",
                    {"error_message": data.get("detail", "No detail provided")}
                )
                return True
            else:
                self.log_result(
                    "Acesso com token inválido",
                    False,
                    f"Status code inesperado - esperado 401, recebido {response.status_code}",
                    {"response": response.text}
                )
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Acesso com token inválido",
                False,
                f"Erro de conexão: {str(e)}",
                {"exception_type": type(e).__name__}
            )
            
        return False
    
    def run_all_tests(self):
        """Executar todos os testes de autenticação"""
        print("\n" + "="*80)
        print("INICIANDO TESTES DO SISTEMA DE AUTENTICAÇÃO ZENPRESS")
        print("="*80)
        print(f"Base URL: {self.BASE_URL}")
        print(f"Usuário de teste: {self.test_user['name']} ({self.test_user['email']})")
        print(f"Timestamp: {datetime.now().isoformat()}")
        
        # Lista de testes a executar
        tests = [
            self.test_01_register_user,
            self.test_02_login_user,
            self.test_03_get_user_me,
            self.test_04_register_duplicate_email,
            self.test_05_login_wrong_password,
            self.test_06_access_without_token,
            self.test_07_access_with_invalid_token
        ]
        
        # Executar testes
        passed = 0
        failed = 0
        
        for test_func in tests:
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"\n❌ ERRO INESPERADO no teste {test_func.__name__}: {str(e)}")
                failed += 1
        
        # Relatório final
        self.print_final_report(passed, failed)
        
        return passed, failed
    
    def print_final_report(self, passed, failed):
        """Imprimir relatório final dos testes"""
        total = passed + failed
        success_rate = (passed / total * 100) if total > 0 else 0
        
        print("\n" + "="*80)
        print("RELATÓRIO FINAL - TESTES DE AUTENTICAÇÃO ZENPRESS")
        print("="*80)
        
        print(f"\n📊 ESTATÍSTICAS:")
        print(f"   Total de testes: {total}")
        print(f"   ✅ Passou: {passed}")
        print(f"   ❌ Falhou: {failed}")
        print(f"   📈 Taxa de sucesso: {success_rate:.1f}%")
        
        print(f"\n📋 RESUMO DOS TESTES:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"   {status} {result['test']}: {result['message']}")
        
        print(f"\n🎯 CONCLUSÃO:")
        if failed == 0:
            print("   🎉 TODOS OS TESTES PASSARAM! Sistema de autenticação funcionando perfeitamente.")
        elif passed > failed:
            print("   ⚠️  MAIORIA DOS TESTES PASSOU, mas há alguns problemas que precisam ser corrigidos.")
        else:
            print("   🚨 MUITOS TESTES FALHARAM. Sistema de autenticação precisa de correções urgentes.")
        
        print(f"\n🔍 PROBLEMAS IDENTIFICADOS:")
        failed_tests = [r for r in self.test_results if not r["success"]]
        if not failed_tests:
            print("   ✅ Nenhum problema identificado!")
        else:
            for result in failed_tests:
                print(f"   ❌ {result['test']}: {result['message']}")
                if result["details"]:
                    print(f"      Detalhes: {result['details']}")
        
        print("\n" + "="*80)

def main():
    """Função principal para executar os testes"""
    tester = ZenPressAuthTest()
    passed, failed = tester.run_all_tests()
    
    # Retornar código de saída apropriado
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    exit(main())