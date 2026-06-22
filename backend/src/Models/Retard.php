<?php

declare(strict_types=1);

namespace App\Models;

use App\Core\Model;

class Retard extends Model
{
    protected string $table = 'retard';
    protected string $primaryKey = 'id_evenement';
}
