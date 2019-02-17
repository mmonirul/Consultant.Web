using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Adocka.Consultant.Web.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        [Route("app")]
        public IActionResult App()
        {
            return View();
        }

        public IActionResult Error()
        {
            return View();
        }
    }
}
