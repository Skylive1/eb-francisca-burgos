// @ts-ignore: Deno se reconoce en el entorno de Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1'

// Declaramos Deno para que el editor local no marque error
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // Manejar preflight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('ADMIN_SERVICE_ROLE_KEY') ?? ''

    if (!serviceRoleKey) {
      throw new Error('Configuración incompleta: La variable de entorno ADMIN_SERVICE_ROLE_KEY no está configurada en los Secrets.')
    }

    // Cliente con privilegios de administrador
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // Verificar autorización del que solicita
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No se proporcionó encabezado de autorización')
    }

    const supabaseUser = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // 1. Obtener el usuario que hace la petición
    const { data: { user: requester }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !requester) {
      throw new Error(`No autorizado: ${authError?.message || 'Usuario no autenticado'}`)
    }

    // 2. Verificar si es admin en la tabla de perfiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', requester.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      throw new Error('Prohibido: Solo los administradores pueden realizar esta acción')
    }

    // 3. Procesar el cuerpo de la petición
    const body = await req.json()
    const { userId, action } = body

    if (!userId) {
      throw new Error('Se requiere el ID del usuario target')
    }

    if (action === 'deleteUser') {
      console.log(`Eliminando usuario: ${userId}`)
      
      // Intentar eliminar de la tabla profiles primero (opcional, por si no hay cascade)
      // Pero mejor dejar que la API Admin maneje la eliminación de Auth
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId)
      
      if (deleteAuthError) {
        console.error("Error al eliminar en Auth:", deleteAuthError)
        // Si falla en Auth, intentamos al menos en profiles por si el usuario ya no existe en Auth
        const { error: deleteProfileError } = await supabaseAdmin.from('profiles').delete().eq('id', userId)
        if (deleteProfileError) throw new Error(`Error al eliminar: ${deleteAuthError.message} y ${deleteProfileError.message}`)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Usuario eliminado correctamente'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      // Por defecto: Cambio de contraseña
      const { newPassword } = body
      
      if (!newPassword) {
        throw new Error('Se requiere la nueva contraseña')
      }

      if (newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres')
      }

      // 4. Actualizar la contraseña usando la API Admin
      const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      )

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Contraseña actualizada correctamente',
          user: data.user.email 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
  } catch (error: any) {
    console.error("Error en función admin:", error.message)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
