using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace InventoryManagement.API.Classes
{
    public class TokenService
    {
        private readonly IConfiguration _config;
        public TokenService(IConfiguration config) => _config = config;

        public string GenerarToken(string usuario, string rol)
        {
            var clave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "UnaClaveMuyLargaYSecretaDe32Chars"));
            var credenciales = new SigningCredentials(clave, SecurityAlgorithms.HmacSha256);

            // Los "Claims" son la información que viaja DENTRO del token cifrado
            var claims = new[] {
            new Claim(ClaimTypes.Name, usuario),
            new Claim(ClaimTypes.Role, rol) // El rol que viene de SQL
        };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(8), // El token dura 8 horas
                signingCredentials: credenciales);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}