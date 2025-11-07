add_action('rest_api_init', function () {
    register_rest_route('consulta-esim/v1', '/verificar/', array(
        'methods' => 'GET',
        'callback' => 'consultar_esim',
        'permission_callback' => '__return_true'
    ));
});

function consultar_esim($data) {
    $imei = sanitize_text_field($_GET['imei']);

    if (!$imei) {
        return new WP_REST_Response(['error' => 'IMEI faltante'], 400);
    }

    $url = 'https://checkimei.altanredes.com/' . $imei;
    $response = wp_remote_get($url);

    if (is_wp_error($response)) {
        return new WP_REST_Response(['error' => 'No se pudo conectar'], 500);
    }

    $body = wp_remote_retrieve_body($response);

    preg_match('/Soporta E-SIM<\/td>\s*<td[^>]*>([^<]*)<\/td>/', $body, $matches);
    $esim = isset($matches[1]) ? trim($matches[1]) : 'Desconocido';

    return new WP_REST_Response(['esim' => $esim], 200);
}
