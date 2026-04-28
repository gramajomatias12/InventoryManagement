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

        public string GenerarToken(string usuario, string perfil, int? cdSistema = null)
        {
            var clave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "UnaClaveMuyLargaYSecretaDe32Chars"));
            var credenciales = new SigningCredentials(clave, SecurityAlgorithms.HmacSha256);

            var roleClaimValue = perfil;

            var claims = new List<Claim>
            {
                new(ClaimTypes.Name, usuario),
                new(ClaimTypes.Role, roleClaimValue),
                new("perfil", perfil)
            };

            if (cdSistema.HasValue)
            {
                claims.Add(new("cdSistema", cdSistema.Value.ToString()));
            }

            // Los "Claims" son la información que viaja DENTRO del token cifrado

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